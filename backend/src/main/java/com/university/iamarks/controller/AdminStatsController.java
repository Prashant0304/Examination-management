package com.university.iamarks.controller;

import com.university.iamarks.dto.AdminStatsResponse;
import com.university.iamarks.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {

    private final StatsService statsService;

    @GetMapping
    public AdminStatsResponse stats() {
        return statsService.getAdminStats();
    }
}
