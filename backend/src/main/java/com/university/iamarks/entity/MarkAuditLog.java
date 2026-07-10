package com.university.iamarks.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "mark_audit_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarkAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mark_id", nullable = false)
    private Marks mark;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;

    @Column(nullable = false, length = 30)
    private String action;

    @Column(name = "old_ia_marks", precision = 5, scale = 2)
    private BigDecimal oldIaMarks;

    @Column(name = "new_ia_marks", precision = 5, scale = 2)
    private BigDecimal newIaMarks;

    @Column(name = "old_external_marks", precision = 5, scale = 2)
    private BigDecimal oldExternalMarks;

    @Column(name = "new_external_marks", precision = 5, scale = 2)
    private BigDecimal newExternalMarks;

    @Column(name = "old_status", length = 30)
    private String oldStatus;

    @Column(name = "new_status", length = 30)
    private String newStatus;

    @Column(length = 500)
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
