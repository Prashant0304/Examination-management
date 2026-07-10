package com.university.iamarks.service;

import com.university.iamarks.dto.AdminStatsResponse;
import com.university.iamarks.enums.MarkStatus;
import com.university.iamarks.enums.Role;
import com.university.iamarks.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final ExamCycleRepository examCycleRepository;
    private final MarksRepository marksRepository;

    public AdminStatsResponse getAdminStats() {
        long totalUsers = userRepository.count();
        long totalFaculty = userRepository.findByRole(Role.FACULTY).size();
        long totalStudents = userRepository.findByRole(Role.STUDENT).size();
        long totalSubjects = subjectRepository.count();
        long openCycles = examCycleRepository.findAll().stream()
                .filter(c -> "OPEN".equals(c.getStatus())).count();
        long pendingHod = marksRepository.findByStatus(MarkStatus.SUBMITTED).size();
        long pendingAdmin = marksRepository.findByStatus(MarkStatus.HOD_APPROVED).size();
        long finalized = marksRepository.findByStatus(MarkStatus.ADMIN_APPROVED).size();

        return new AdminStatsResponse(totalUsers, totalFaculty, totalStudents, totalSubjects,
                openCycles, pendingHod, pendingAdmin, finalized);
    }
}
