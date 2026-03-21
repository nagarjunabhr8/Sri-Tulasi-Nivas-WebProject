package com.sritulasinivas.repository;

import com.sritulasinivas.entity.Apartment;
import com.sritulasinivas.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, Long> {
    Page<Apartment> findByStatus(Apartment.ApartmentStatus status, Pageable pageable);
    List<Apartment> findByOwner(User owner);
    Page<Apartment> findByOwner(User owner, Pageable pageable);
}
