package com.university.iamarks.controller;

import com.university.iamarks.dto.MarksResponse;
import com.university.iamarks.entity.User;
import com.university.iamarks.service.MarksService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/student/marks")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
public class StudentController {

    private final MarksService marksService;

    /** Students only ever see their own finalized/in-progress marks - never someone else's. */
    @GetMapping("/me")
    public List<MarksResponse> myMarks(@AuthenticationPrincipal User student) {
        return marksService.getForStudent(student.getId());
    }
}
