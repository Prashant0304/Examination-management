package com.university.iamarks.service;

import com.university.iamarks.dto.MarksEntryRequest;
import com.university.iamarks.dto.MarksResponse;
import com.university.iamarks.entity.*;
import com.university.iamarks.enums.MarkStatus;
import com.university.iamarks.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarksService {

    private final MarksRepository marksRepository;
    private final SubjectRepository subjectRepository;
    private final ExamCycleRepository examCycleRepository;
    private final UserRepository userRepository;
    private final MarkAuditLogRepository auditLogRepository;
    private final FacultySubjectAssignmentRepository facultyAssignmentRepository;
    private final StudentSubjectEnrollmentRepository enrollmentRepository;

    /** Faculty creates or updates a mark entry (only while in DRAFT or REOPENED / REJECTED state). */
    @Transactional
    public MarksResponse enterMarks(MarksEntryRequest req, User actingFaculty) {
        Subject subject = subjectRepository.findById(req.subjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        ExamCycle cycle = examCycleRepository.findById(req.examCycleId())
                .orElseThrow(() -> new IllegalArgumentException("Exam cycle not found"));

        if ("CLOSED".equals(cycle.getStatus())) {
            throw new IllegalStateException("This exam cycle is closed for edits");
        }

        boolean assigned = facultyAssignmentRepository.existsByFacultyIdAndSubjectIdAndExamCycleId(
                actingFaculty.getId(), subject.getId(), cycle.getId());
        if (!assigned) {
            throw new IllegalStateException("You are not assigned to this subject for this exam cycle");
        }

        User student = userRepository.findById(req.studentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        validateMarksRange(req, subject);

        Marks mark = marksRepository.findByStudentIdAndSubjectIdAndExamCycleId(
                        req.studentId(), req.subjectId(), req.examCycleId())
                .orElseGet(() -> Marks.builder()
                        .student(student)
                        .subject(subject)
                        .examCycle(cycle)
                        .status(MarkStatus.DRAFT)
                        .build());

        if (mark.getId() != null && !isEditable(mark.getStatus())) {
            throw new IllegalStateException("Marks cannot be edited in status " + mark.getStatus());
        }

        var oldIa = mark.getIaMarks();
        var oldExternal = mark.getExternalMarks();
        var oldStatus = mark.getStatus();

        mark.setIaMarks(req.iaMarks());
        mark.setExternalMarks(req.externalMarks());
        mark.setEnteredBy(actingFaculty);
        mark.setStatus(MarkStatus.DRAFT);

        Marks saved = marksRepository.save(mark);

        logAudit(saved, actingFaculty, oldStatus == null ? "CREATED" : "UPDATED",
                oldIa, req.iaMarks(), oldExternal, req.externalMarks(),
                oldStatus, MarkStatus.DRAFT, null);

        return toResponse(saved);
    }

    @Transactional
    public MarksResponse submitForApproval(Long markId, User actingFaculty) {
        Marks mark = getOwnedMark(markId, actingFaculty);

        if (mark.getStatus() != MarkStatus.DRAFT && mark.getStatus() != MarkStatus.REJECTED) {
            throw new IllegalStateException("Only draft or rejected marks can be submitted");
        }
        if (mark.getIaMarks() == null || mark.getExternalMarks() == null) {
            throw new IllegalStateException("Both IA and external marks must be entered before submission");
        }

        MarkStatus old = mark.getStatus();
        mark.setStatus(MarkStatus.SUBMITTED);
        mark.setRejectionReason(null);
        Marks saved = marksRepository.save(mark);

        logAudit(saved, actingFaculty, "SUBMITTED", null, null, null, null, old, MarkStatus.SUBMITTED, null);
        return toResponse(saved);
    }

    @Transactional
    public MarksResponse hodApprove(Long markId, User hod, String note) {
        Marks mark = marksRepository.findById(markId)
                .orElseThrow(() -> new IllegalArgumentException("Marks record not found"));

        if (mark.getStatus() != MarkStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted marks can be HOD-approved");
        }

        MarkStatus old = mark.getStatus();
        mark.setStatus(MarkStatus.HOD_APPROVED);
        mark.setHodReviewedBy(hod);
        mark.setHodReviewedAt(java.time.LocalDateTime.now());
        Marks saved = marksRepository.save(mark);

        logAudit(saved, hod, "HOD_APPROVED", null, null, null, null, old, MarkStatus.HOD_APPROVED, note);
        return toResponse(saved);
    }

    @Transactional
    public MarksResponse adminApprove(Long markId, User admin, String note) {
        Marks mark = marksRepository.findById(markId)
                .orElseThrow(() -> new IllegalArgumentException("Marks record not found"));

        if (mark.getStatus() != MarkStatus.HOD_APPROVED) {
            throw new IllegalStateException("Only HOD-approved marks can receive final admin approval");
        }

        MarkStatus old = mark.getStatus();
        mark.setStatus(MarkStatus.ADMIN_APPROVED);
        mark.setAdminReviewedBy(admin);
        mark.setAdminReviewedAt(java.time.LocalDateTime.now());
        Marks saved = marksRepository.save(mark);

        logAudit(saved, admin, "ADMIN_APPROVED", null, null, null, null, old, MarkStatus.ADMIN_APPROVED, note);
        return toResponse(saved);
    }

    @Transactional
    public MarksResponse reject(Long markId, User reviewer, String reason) {
        Marks mark = marksRepository.findById(markId)
                .orElseThrow(() -> new IllegalArgumentException("Marks record not found"));

        if (mark.getStatus() != MarkStatus.SUBMITTED && mark.getStatus() != MarkStatus.HOD_APPROVED) {
            throw new IllegalStateException("Only submitted or HOD-approved marks can be rejected");
        }

        MarkStatus old = mark.getStatus();
        mark.setStatus(MarkStatus.REJECTED);
        mark.setRejectionReason(reason);
        Marks saved = marksRepository.save(mark);

        logAudit(saved, reviewer, "REJECTED", null, null, null, null, old, MarkStatus.REJECTED, reason);
        return toResponse(saved);
    }

    /** Admin-only: reopen a finalized record for correction (fully logged). */
    @Transactional
    public MarksResponse reopen(Long markId, User admin, String reason) {
        Marks mark = marksRepository.findById(markId)
                .orElseThrow(() -> new IllegalArgumentException("Marks record not found"));

        if (mark.getStatus() != MarkStatus.ADMIN_APPROVED) {
            throw new IllegalStateException("Only finalized (admin-approved) marks can be reopened");
        }

        MarkStatus old = mark.getStatus();
        mark.setStatus(MarkStatus.REOPENED);
        Marks saved = marksRepository.save(mark);

        logAudit(saved, admin, "REOPENED", null, null, null, null, old, MarkStatus.REOPENED, reason);
        return toResponse(saved);
    }

    public List<MarksResponse> getForStudent(Long studentId) {
        return marksRepository.findByStudentId(studentId).stream().map(this::toResponse).toList();
    }

    public List<MarksResponse> getForSubjectCycle(Long subjectId, Long examCycleId) {
        return marksRepository.findBySubjectIdAndExamCycleId(subjectId, examCycleId)
                .stream().map(this::toResponse).toList();
    }

    public List<MarksResponse> getPendingForHod(Long departmentId) {
        return marksRepository.findByStatusAndSubject_Department_Id(MarkStatus.SUBMITTED, departmentId)
                .stream().map(this::toResponse).toList();
    }

    public List<MarksResponse> getPendingForAdmin() {
        return marksRepository.findByStatus(MarkStatus.HOD_APPROVED)
                .stream().map(this::toResponse).toList();
    }

    public List<com.university.iamarks.dto.FacultyAssignmentResponse> getAssignmentsForFaculty(Long facultyId) {
        return facultyAssignmentRepository.findByFacultyId(facultyId).stream()
                .map(a -> new com.university.iamarks.dto.FacultyAssignmentResponse(
                        a.getSubject().getId(),
                        a.getSubject().getCode(),
                        a.getSubject().getName(),
                        a.getExamCycle().getId(),
                        a.getExamCycle().getName(),
                        a.getExamCycle().getStatus()
                ))
                .toList();
    }

    /**
     * Full class roster for a subject/cycle: every enrolled student, with their
     * existing Marks record if one exists, or a synthetic unsaved DRAFT row
     * (id = null) if marks haven't been entered yet. Nothing is persisted here.
     */
    public List<MarksResponse> getRosterForSubjectCycle(Long subjectId, Long examCycleId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        ExamCycle cycle = examCycleRepository.findById(examCycleId)
                .orElseThrow(() -> new IllegalArgumentException("Exam cycle not found"));

        var existingByStudent = marksRepository.findBySubjectIdAndExamCycleId(subjectId, examCycleId)
                .stream().collect(java.util.stream.Collectors.toMap(m -> m.getStudent().getId(), m -> m));

        return enrollmentRepository.findBySubjectIdAndExamCycleId(subjectId, examCycleId).stream()
                .map(enrollment -> {
                    Marks existing = existingByStudent.get(enrollment.getStudent().getId());
                    if (existing != null) {
                        return toResponse(existing);
                    }
                    User student = enrollment.getStudent();
                    return new MarksResponse(
                            null, student.getId(), student.getFullName(), student.getUsn(),
                            subject.getId(), subject.getCode(), subject.getName(),
                            cycle.getId(), null, null, null, MarkStatus.DRAFT.name(), null
                    );
                })
                .toList();
    }

    // ---- helpers ----

    private Marks getOwnedMark(Long markId, User faculty) {
        Marks mark = marksRepository.findById(markId)
                .orElseThrow(() -> new IllegalArgumentException("Marks record not found"));
        if (mark.getEnteredBy() == null || !mark.getEnteredBy().getId().equals(faculty.getId())) {
            throw new IllegalStateException("You can only submit marks you entered");
        }
        return mark;
    }

    private boolean isEditable(MarkStatus status) {
        return status == MarkStatus.DRAFT || status == MarkStatus.REJECTED || status == MarkStatus.REOPENED;
    }

    private void validateMarksRange(MarksEntryRequest req, Subject subject) {
        if (req.iaMarks() != null && req.iaMarks().compareTo(subject.getIaMaxMarks()) > 0) {
            throw new IllegalArgumentException("IA marks exceed maximum of " + subject.getIaMaxMarks());
        }
        if (req.externalMarks() != null && req.externalMarks().compareTo(subject.getExternalMaxMarks()) > 0) {
            throw new IllegalArgumentException("External marks exceed maximum of " + subject.getExternalMaxMarks());
        }
    }

    private void logAudit(Marks mark, User actor, String action,
                           java.math.BigDecimal oldIa, java.math.BigDecimal newIa,
                           java.math.BigDecimal oldExternal, java.math.BigDecimal newExternal,
                           MarkStatus oldStatus, MarkStatus newStatus, String note) {
        MarkAuditLog log = MarkAuditLog.builder()
                .mark(mark)
                .changedBy(actor)
                .action(action)
                .oldIaMarks(oldIa)
                .newIaMarks(newIa)
                .oldExternalMarks(oldExternal)
                .newExternalMarks(newExternal)
                .oldStatus(oldStatus == null ? null : oldStatus.name())
                .newStatus(newStatus == null ? null : newStatus.name())
                .note(note)
                .build();
        auditLogRepository.save(log);
    }

    private MarksResponse toResponse(Marks m) {
        return new MarksResponse(
                m.getId(),
                m.getStudent().getId(),
                m.getStudent().getFullName(),
                m.getStudent().getUsn(),
                m.getSubject().getId(),
                m.getSubject().getCode(),
                m.getSubject().getName(),
                m.getExamCycle().getId(),
                m.getIaMarks(),
                m.getExternalMarks(),
                m.getTotalMarks(),
                m.getStatus().name(),
                m.getRejectionReason()
        );
    }
}
