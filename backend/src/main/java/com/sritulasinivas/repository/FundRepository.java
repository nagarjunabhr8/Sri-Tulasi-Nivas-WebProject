package com.sritulasinivas.repository;

import com.sritulasinivas.entity.Fund;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FundRepository extends JpaRepository<Fund, UUID> {
    List<Fund> findByTypeOrderByDateDesc(String type);
    List<Fund> findAllByOrderByDateDesc();
}
