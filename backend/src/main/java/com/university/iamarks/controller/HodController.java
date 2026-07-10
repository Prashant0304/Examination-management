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
@RequestMapping("/api/hod/marks")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HOD','ADMIN')")
public class HodController {

    private final MarksService marksService;

    @GetMapping("/pending")
    public List<MarksResponse> pending(@AuthenticationPrincipal User hod) {
        return marksService.getPendingForHod(hod.getDepartment().getId());
    }

    @PostMapping("/{markId}/approve")
    public MarksResponse approve(@PathVariable Long markId,
                                  @RequestBody(required = false) ApprovalRequest request,
                                  @AuthenticationPrincipal User hod) {
        String note = request != null ? request.note() : null;
        return marksService.hodApprove(markId, hod, note);
    }

    @PostMapping("/{markId}/reject")
    public MarksResponse reject(@PathVariable Long markId,
                                 @Valid @RequestBody RejectionRequest request,
                                 @AuthenticationPrincipal User hod) {
        return marksService.reject(markId, hod, request.reason());
    }
}
