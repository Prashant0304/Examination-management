package com.university.iamarks.controller;

import com.university.iamarks.dto.*;
import com.university.iamarks.entity.Department;
import com.university.iamarks.entity.ExamCycle;
import com.university.iamarks.entity.Subject;
import com.university.iamarks.service.CatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/catalog")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCatalogController {

    private final CatalogService catalogService;

    @PostMapping("/departments")
    public Department createDepartment(@Valid @RequestBody CreateDepartmentRequest req) {
        return catalogService.createDepartment(req);
    }

    @GetMapping("/departments")
    public List<Department> listDepartments() {
        return catalogService.listDepartments();
    }

    @PostMapping("/subjects")
    public Subject createSubject(@Valid @RequestBody CreateSubjectRequest req) {
        return catalogService.createSubject(req);
    }

    @GetMapping("/subjects")
    public List<Subject> listSubjects() {
        return catalogService.listSubjects();
    }

    @PostMapping("/exam-cycles")
    public ExamCycle createExamCycle(@Valid @RequestBody CreateExamCycleRequest req) {
        return catalogService.createExamCycle(req);
    }

    @GetMapping("/exam-cycles")
    public List<ExamCycle> listExamCycles() {
        return catalogService.listExamCycles();
    }

    @PatchMapping("/exam-cycles/{id}/close")
    public ExamCycle closeExamCycle(@PathVariable Long id) {
        return catalogService.closeExamCycle(id);
    }

    @PostMapping("/faculty-assignments")
    public void assignFaculty(@Valid @RequestBody AssignFacultyRequest req) {
        catalogService.assignFaculty(req);
    }

    @PostMapping("/student-enrollments")
    public void enrollStudent(@Valid @RequestBody EnrollStudentRequest req) {
        catalogService.enrollStudent(req);
    }
}
