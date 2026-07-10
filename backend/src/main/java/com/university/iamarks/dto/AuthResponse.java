package com.university.iamarks.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String role,
        String fullName,
        Long userId
) {}
