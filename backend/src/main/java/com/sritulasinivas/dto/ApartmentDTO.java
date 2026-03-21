package com.sritulasinivas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApartmentDTO {
    private Long id;
    private String unitNumber;
    private Integer floor;
    private Integer bedrooms;
    private Integer bathrooms;
    private BigDecimal area;
    private BigDecimal maintenanceFee;
    private String status;
    private String description;
    private String amenities;
    private Long ownerId;
    private String ownerName;
}
