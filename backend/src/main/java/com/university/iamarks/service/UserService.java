package com.university.iamarks.service;

import com.university.iamarks.dto.CreateUserRequest;
import com.university.iamarks.dto.UserResponse;
import com.university.iamarks.entity.Department;
import com.university.iamarks.entity.User;
import com.university.iamarks.repository.DepartmentRepository;
import com.university.iamarks.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse createUser(CreateUserRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("A user with this email already exists");
        }

        Department department = null;
        if (req.departmentId() != null) {
            department = departmentRepository.findById(req.departmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        }

        User user = User.builder()
                .fullName(req.fullName())
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(req.role())
                .department(department)
                .usn(req.usn())
                .active(true)
                .failedLoginAttempts(0)
                .build();

        return toResponse(userRepository.save(user));
    }

    public List<UserResponse> listAll() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public UserResponse setActive(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setActive(active);
        return toResponse(userRepository.save(user));
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                u.getRole().name(),
                u.getDepartment() != null ? u.getDepartment().getId() : null,
                u.getDepartment() != null ? u.getDepartment().getName() : null,
                u.getUsn(),
                u.isActive()
        );
    }
}
