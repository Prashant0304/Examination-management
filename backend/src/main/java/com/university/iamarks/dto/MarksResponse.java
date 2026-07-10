package com.university.iamarks.dto;

import java.math.BigDecimal;

public record MarksResponse(
        Long id,
        Long studentId,
        String studentName,
        String usn,
        Long subjectId,
        String subjectCode,
        String subjectName,
        Long examCycleId,
        BigDecimal iaMarks,
        BigDecimal externalMarks,
        BigDecimal totalMarks,
        String status,
        String rejectionReason
) {}
