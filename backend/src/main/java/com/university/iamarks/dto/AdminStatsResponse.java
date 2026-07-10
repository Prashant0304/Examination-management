package com.university.iamarks.dto;

public record AdminStatsResponse(
        long totalUsers,
        long totalFaculty,
        long totalStudents,
        long totalSubjects,
        long openExamCycles,
        long pendingHodApproval,
        long pendingAdminApproval,
        long finalizedRecords
) {}
