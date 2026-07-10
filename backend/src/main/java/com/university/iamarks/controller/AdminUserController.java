package com.university.iamarks.controller;

import com.university.iamarks.dto.CreateUserRequest;
import com.university.iamarks.dto.UserResponse;
import com.university.iamarks.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @PostMapping
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }

    @GetMapping
    public List<UserResponse> list() {
        return userService.listAll();
    }

    @PatchMapping("/{userId}/activate")
    public UserResponse activate(@PathVariable Long userId) {
        return userService.setActive(userId, true);
    }

    @PatchMapping("/{userId}/deactivate")
    public UserResponse deactivate(@PathVariable Long userId) {
        return userService.setActive(userId, false);
    }
}
