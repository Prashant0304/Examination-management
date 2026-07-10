package com.university.iamarks.dto;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String role,
        Long departmentId,
        String departmentName,
        String usn,
        boolean active
) {}
