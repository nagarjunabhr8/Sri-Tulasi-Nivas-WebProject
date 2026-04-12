package com.sritulasinivas.repository;

import com.sritulasinivas.entity.MaintenanceSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MaintenanceSettingRepository extends JpaRepository<MaintenanceSetting, UUID> {
    Optional<MaintenanceSetting> findByMonthAndYear(String month, int year);
    List<MaintenanceSetting> findAllByOrderByYearDescCreatedAtDesc();
}
