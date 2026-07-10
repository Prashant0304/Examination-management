package com.university.iamarks.dto;

import jakarta.validation.constraints.NotNull;

public record EnrollStudentRequest(
        @NotNull Long studentId,
        @NotNull Long subjectId,
        @NotNull Long examCycleId
) {}
