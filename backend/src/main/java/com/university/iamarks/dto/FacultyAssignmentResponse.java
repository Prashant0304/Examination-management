package com.university.iamarks.dto;

public record FacultyAssignmentResponse(
        Long subjectId,
        String subjectCode,
        String subjectName,
        Long examCycleId,
        String examCycleName,
        String examCycleStatus
) {}
