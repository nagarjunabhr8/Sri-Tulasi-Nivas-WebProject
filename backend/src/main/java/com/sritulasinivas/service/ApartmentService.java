package com.sritulasinivas.service;

import com.sritulasinivas.dto.ApartmentDTO;
import com.sritulasinivas.entity.Apartment;
import com.sritulasinivas.entity.User;
import com.sritulasinivas.repository.ApartmentRepository;
import com.sritulasinivas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApartmentService {

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<ApartmentDTO> getAvailableApartments(Pageable pageable) {
        return apartmentRepository.findByStatus(Apartment.ApartmentStatus.AVAILABLE, pageable)
            .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public List<ApartmentDTO> getOwnerApartments(Long ownerId) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("Owner not found"));
        
        return apartmentRepository.findByOwner(owner).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public ApartmentDTO createApartment(ApartmentDTO dto, Long ownerId) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("Owner not found"));

        Apartment apartment = new Apartment();
        apartment.setUnitNumber(dto.getUnitNumber());
        apartment.setFloor(dto.getFloor());
        apartment.setBedrooms(dto.getBedrooms());
        apartment.setBathrooms(dto.getBathrooms());
        apartment.setArea(dto.getArea());
        apartment.setMaintenanceFee(dto.getMaintenanceFee());
        apartment.setStatus(Apartment.ApartmentStatus.valueOf(dto.getStatus()));
        apartment.setDescription(dto.getDescription());
        apartment.setAmenities(dto.getAmenities());
        apartment.setOwner(owner);

        Apartment saved = apartmentRepository.save(apartment);
        return mapToDTO(saved);
    }

    @Transactional
    public ApartmentDTO updateApartment(Long apartmentId, ApartmentDTO dto) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
            .orElseThrow(() -> new RuntimeException("Apartment not found"));

        apartment.setUnitNumber(dto.getUnitNumber());
        apartment.setFloor(dto.getFloor());
        apartment.setBedrooms(dto.getBedrooms());
        apartment.setBathrooms(dto.getBathrooms());
        apartment.setArea(dto.getArea());
        apartment.setMaintenanceFee(dto.getMaintenanceFee());
        apartment.setStatus(Apartment.ApartmentStatus.valueOf(dto.getStatus()));
        apartment.setDescription(dto.getDescription());
        apartment.setAmenities(dto.getAmenities());

        Apartment updated = apartmentRepository.save(apartment);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteApartment(Long apartmentId) {
        apartmentRepository.deleteById(apartmentId);
    }

    private ApartmentDTO mapToDTO(Apartment apartment) {
        return new ApartmentDTO(
            apartment.getId(),
            apartment.getUnitNumber(),
            apartment.getFloor(),
            apartment.getBedrooms(),
            apartment.getBathrooms(),
            apartment.getArea(),
            apartment.getMaintenanceFee(),
            apartment.getStatus().toString(),
            apartment.getDescription(),
            apartment.getAmenities(),
            apartment.getOwner().getId(),
            apartment.getOwner().getFirstName() + " " + apartment.getOwner().getLastName()
        );
    }
}
