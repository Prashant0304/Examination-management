package com.university.iamarks.dto;

import jakarta.validation.constraints.NotBlank;

public record RejectionRequest(
        @NotBlank String reason
) {}
