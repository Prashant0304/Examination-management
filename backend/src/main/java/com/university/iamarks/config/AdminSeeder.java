package com.university.iamarks.config;

import com.university.iamarks.entity.Department;
import com.university.iamarks.entity.User;
import com.university.iamarks.enums.Role;
import com.university.iamarks.repository.DepartmentRepository;
import com.university.iamarks.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates the first ADMIN account on startup if none exists yet, using credentials
 * supplied via environment variables (never hardcoded/committed).
 *
 * Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment/.env before first run.
 * Change the password immediately after first login.
 */
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:admin@university.edu}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        boolean adminExists = !userRepository.findByRole(Role.ADMIN).isEmpty();
        if (adminExists) {
            return;
        }

        if (adminPassword == null || adminPassword.isBlank()) {
            System.out.println("========================================================================");
            System.out.println("WARNING: No ADMIN account exists and ADMIN_PASSWORD is not set.");
            System.out.println("Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables and restart");
            System.out.println("to create the first administrator account.");
            System.out.println("========================================================================");
            return;
        }

        Department adminDept = departmentRepository.findAll().stream()
                .filter(d -> "ADMIN".equals(d.getCode()))
                .findFirst()
                .orElseGet(() -> departmentRepository.save(
                        Department.builder().name("Administration").code("ADMIN").build()));

        User admin = User.builder()
                .fullName("System Administrator")
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .department(adminDept)
                .active(true)
                .failedLoginAttempts(0)
                .build();

        userRepository.save(admin);
        System.out.println("Admin account created for: " + adminEmail);
    }
}
