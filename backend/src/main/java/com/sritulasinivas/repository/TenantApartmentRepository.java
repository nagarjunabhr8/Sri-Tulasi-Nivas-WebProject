package com.sritulasinivas.repository;

import com.sritulasinivas.entity.TenantApartment;
import com.sritulasinivas.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TenantApartmentRepository extends JpaRepository<TenantApartment, Long> {
    List<TenantApartment> findByTenant(User tenant);
    List<TenantApartment> findByApartmentId(Long apartmentId);
}
