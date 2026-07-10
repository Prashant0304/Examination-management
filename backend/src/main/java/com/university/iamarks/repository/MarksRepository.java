package com.university.iamarks.repository;

import com.university.iamarks.entity.Marks;
import com.university.iamarks.enums.MarkStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MarksRepository extends JpaRepository<Marks, Long> {
    List<Marks> findByStudentId(Long studentId);
    List<Marks> findBySubjectIdAndExamCycleId(Long subjectId, Long examCycleId);
    List<Marks> findBySubjectIdAndExamCycleIdAndStatus(Long subjectId, Long examCycleId, MarkStatus status);
    List<Marks> findByStatusAndSubject_Department_Id(MarkStatus status, Long departmentId);
    List<Marks> findByStatus(MarkStatus status);
    Optional<Marks> findByStudentIdAndSubjectIdAndExamCycleId(Long studentId, Long subjectId, Long examCycleId);
}
