package com.university.iamarks.repository;

import com.university.iamarks.entity.FacultySubjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacultySubjectAssignmentRepository extends JpaRepository<FacultySubjectAssignment, Long> {
    List<FacultySubjectAssignment> findByFacultyId(Long facultyId);
    boolean existsByFacultyIdAndSubjectIdAndExamCycleId(Long facultyId, Long subjectId, Long examCycleId);
}
