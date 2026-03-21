package com.sritulasinivas.repository;

import com.sritulasinivas.entity.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface MaintenanceRepository extends JpaRepository<Maintenance, UUID> {
    List<Maintenance> findByFlatNoOrderByYearDescMonthDesc(String flatNo);
    List<Maintenance> findByPaidStatus(String paidStatus);

    @Query("SELECT m FROM Maintenance m ORDER BY m.year DESC, m.createdAt DESC")
    List<Maintenance> findAllOrdered();
}
