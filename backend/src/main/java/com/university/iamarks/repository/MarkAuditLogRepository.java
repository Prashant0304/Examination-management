package com.university.iamarks.repository;

import com.university.iamarks.entity.MarkAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarkAuditLogRepository extends JpaRepository<MarkAuditLog, Long> {
    List<MarkAuditLog> findByMarkIdOrderByCreatedAtAsc(Long markId);
}
