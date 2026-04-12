package com.sritulasinivas.repository;

import com.sritulasinivas.entity.FlatDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FlatDetailRepository extends JpaRepository<FlatDetail, UUID> {
    List<FlatDetail> findAllByOrderByFlatNoAsc();
    Optional<FlatDetail> findByFlatNo(String flatNo);
}
