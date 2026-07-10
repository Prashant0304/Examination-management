package com.university.iamarks.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "faculty_subject_assignment", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"faculty_id", "subject_id", "exam_cycle_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultySubjectAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private User faculty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_cycle_id", nullable = false)
    private ExamCycle examCycle;
}
