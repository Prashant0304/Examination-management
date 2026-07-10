package com.university.iamarks.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;

public record MarksEntryRequest(
        @NotNull Long studentId,
        @NotNull Long subjectId,
        @NotNull Long examCycleId,
        @DecimalMin(value = "0.0") BigDecimal iaMarks,
        @DecimalMin(value = "0.0") BigDecimal externalMarks
) {}
