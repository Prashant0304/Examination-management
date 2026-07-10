package com.university.iamarks.service;

import com.university.iamarks.dto.*;
import com.university.iamarks.entity.*;
import com.university.iamarks.enums.Role;
import com.university.iamarks.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final ExamCycleRepository examCycleRepository;
    private final UserRepository userRepository;
    private final FacultySubjectAssignmentRepository facultyAssignmentRepository;
    private final StudentSubjectEnrollmentRepository enrollmentRepository;

    @Transactional
    public Department createDepartment(CreateDepartmentRequest req) {
        return departmentRepository.save(Department.builder().name(req.name()).code(req.code()).build());
    }

    public List<Department> listDepartments() {
        return departmentRepository.findAll();
    }

    @Transactional
    public Subject createSubject(CreateSubjectRequest req) {
        Department dept = departmentRepository.findById(req.departmentId())
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        Subject subject = Subject.builder()
                .code(req.code())
                .name(req.name())
                .department(dept)
                .semester(req.semester())
                .credits(req.credits())
                .iaMaxMarks(req.iaMaxMarks())
                .externalMaxMarks(req.externalMaxMarks())
                .build();
        return subjectRepository.save(subject);
    }

    public List<Subject> listSubjects() {
        return subjectRepository.findAll();
    }

    @Transactional
    public ExamCycle createExamCycle(CreateExamCycleRequest req) {
        ExamCycle cycle = ExamCycle.builder()
                .name(req.name())
                .semester(req.semester())
                .year(req.year())
                .status("OPEN")
                .build();
        return examCycleRepository.save(cycle);
    }

    public List<ExamCycle> listExamCycles() {
        return examCycleRepository.findAll();
    }

    @Transactional
    public ExamCycle closeExamCycle(Long id) {
        ExamCycle cycle = examCycleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exam cycle not found"));
        cycle.setStatus("CLOSED");
        return examCycleRepository.save(cycle);
    }

    @Transactional
    public void assignFaculty(AssignFacultyRequest req) {
        User faculty = userRepository.findById(req.facultyId())
                .orElseThrow(() -> new IllegalArgumentException("Faculty not found"));
        if (faculty.getRole() != Role.FACULTY) {
            throw new IllegalArgumentException("Selected user is not a faculty member");
        }
        Subject subject = subjectRepository.findById(req.subjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        ExamCycle cycle = examCycleRepository.findById(req.examCycleId())
                .orElseThrow(() -> new IllegalArgumentException("Exam cycle not found"));

        if (facultyAssignmentRepository.existsByFacultyIdAndSubjectIdAndExamCycleId(
                faculty.getId(), subject.getId(), cycle.getId())) {
            throw new IllegalStateException("This faculty member is already assigned to this subject/cycle");
        }

        facultyAssignmentRepository.save(FacultySubjectAssignment.builder()
                .faculty(faculty).subject(subject).examCycle(cycle).build());
    }

    @Transactional
    public void enrollStudent(EnrollStudentRequest req) {
        User student = userRepository.findById(req.studentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        if (student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("Selected user is not a student");
        }
        Subject subject = subjectRepository.findById(req.subjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        ExamCycle cycle = examCycleRepository.findById(req.examCycleId())
                .orElseThrow(() -> new IllegalArgumentException("Exam cycle not found"));

        enrollmentRepository.save(StudentSubjectEnrollment.builder()
                .student(student).subject(subject).examCycle(cycle).build());
    }
}
