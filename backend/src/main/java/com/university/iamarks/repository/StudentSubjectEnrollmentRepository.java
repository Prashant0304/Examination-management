package com.university.iamarks.repository;

import com.university.iamarks.entity.StudentSubjectEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentSubjectEnrollmentRepository extends JpaRepository<StudentSubjectEnrollment, Long> {
    List<StudentSubjectEnrollment> findBySubjectIdAndExamCycleId(Long subjectId, Long examCycleId);
    List<StudentSubjectEnrollment> findByStudentId(Long studentId);
}
