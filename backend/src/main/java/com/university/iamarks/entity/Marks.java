package com.university.iamarks.entity;

import com.university.iamarks.enums.MarkStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marks", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "subject_id", "exam_cycle_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Marks {

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

    @Column(name = "ia_marks", precision = 5, scale = 2)
    private BigDecimal iaMarks;

    @Column(name = "external_marks", precision = 5, scale = 2)
    private BigDecimal externalMarks;

    // total_marks is a DB-generated column (STORED). Read-only from JPA's perspective.
    @Column(name = "total_marks", precision = 6, scale = 2, insertable = false, updatable = false)
    private BigDecimal totalMarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MarkStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entered_by")
    private User enteredBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hod_reviewed_by")
    private User hodReviewedBy;

    @Column(name = "hod_reviewed_at")
    private LocalDateTime hodReviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_reviewed_by")
    private User adminReviewedBy;

    @Column(name = "admin_reviewed_at")
    private LocalDateTime adminReviewedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) status = MarkStatus.DRAFT;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
