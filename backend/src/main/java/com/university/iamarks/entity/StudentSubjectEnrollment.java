package com.university.iamarks.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_subject_enrollment", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "subject_id", "exam_cycle_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentSubjectEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_cycle_id", nullable = false)
    private ExamCycle examCycle;
}
