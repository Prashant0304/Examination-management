package com.university.iamarks.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record CreateExamCycleRequest(
        @NotBlank String name,
        @Positive int semester,
        @Positive int year
) {}
