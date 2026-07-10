package com.university.iamarks.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CreateSubjectRequest(
        @NotBlank String code,
        @NotBlank String name,
        @NotNull Long departmentId,
        @Positive int semester,
        int credits,
        @NotNull BigDecimal iaMaxMarks,
        @NotNull BigDecimal externalMaxMarks
) {}
