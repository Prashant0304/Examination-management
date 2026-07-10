package com.university.iamarks.controller;

import com.university.iamarks.dto.MarksEntryRequest;
import com.university.iamarks.dto.MarksResponse;
import com.university.iamarks.entity.User;
import com.university.iamarks.service.MarksService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculty/marks")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
public class FacultyController {

    private final MarksService marksService;

    @PostMapping
    public MarksResponse enterMarks(@Valid @RequestBody MarksEntryRequest request,
                                     @AuthenticationPrincipal User faculty) {
        return marksService.enterMarks(request, faculty);
    }

    @PostMapping("/{markId}/submit")
    public MarksResponse submit(@PathVariable Long markId, @AuthenticationPrincipal User faculty) {
        return marksService.submitForApproval(markId, faculty);
    }

    @GetMapping("/subject/{subjectId}/cycle/{examCycleId}")
    public List<MarksResponse> viewSubjectMarks(@PathVariable Long subjectId, @PathVariable Long examCycleId) {
        return marksService.getForSubjectCycle(subjectId, examCycleId);
    }

    /** All subjects/cycles this faculty member is assigned to - drives the dropdown in the UI. */
    @GetMapping("/assignments")
    public List<com.university.iamarks.dto.FacultyAssignmentResponse> myAssignments(@AuthenticationPrincipal User faculty) {
        return marksService.getAssignmentsForFaculty(faculty.getId());
    }

    /** Full enrolled-student roster for a subject/cycle, including students with no marks entered yet. */
    @GetMapping("/roster/{subjectId}/cycle/{examCycleId}")
    public List<MarksResponse> roster(@PathVariable Long subjectId, @PathVariable Long examCycleId) {
        return marksService.getRosterForSubjectCycle(subjectId, examCycleId);
    }
}