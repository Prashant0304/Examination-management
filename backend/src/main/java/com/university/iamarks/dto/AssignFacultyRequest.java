package com.university.iamarks.dto;

import jakarta.validation.constraints.NotNull;

public record AssignFacultyRequest(
        @NotNull Long facultyId,
        @NotNull Long subjectId,
        @NotNull Long examCycleId
) {}
