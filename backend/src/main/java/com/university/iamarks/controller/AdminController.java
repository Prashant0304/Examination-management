package com.university.iamarks.controller;

import com.university.iamarks.dto.ApprovalRequest;
import com.university.iamarks.dto.MarksResponse;
import com.university.iamarks.dto.RejectionRequest;
import com.university.iamarks.entity.User;
import com.university.iamarks.service.MarksService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/marks")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final MarksService marksService;

    @GetMapping("/pending")
    public List<MarksResponse> pending() {
        return marksService.getPendingForAdmin();
    }

    @PostMapping("/{markId}/approve")
    public MarksResponse approve(@PathVariable Long markId,
                                  @RequestBody(required = false) ApprovalRequest request,
                                  @AuthenticationPrincipal User admin) {
        String note = request != null ? request.note() : null;
        return marksService.adminApprove(markId, admin, note);
    }

    @PostMapping("/{markId}/reject")
    public MarksResponse reject(@PathVariable Long markId,
                                 @Valid @RequestBody RejectionRequest request,
                                 @AuthenticationPrincipal User admin) {
        return marksService.reject(markId, admin, request.reason());
    }

    @PostMapping("/{markId}/reopen")
    public MarksResponse reopen(@PathVariable Long markId,
                                 @Valid @RequestBody RejectionRequest request,
                                 @AuthenticationPrincipal User admin) {
        return marksService.reopen(markId, admin, request.reason());
    }
}
