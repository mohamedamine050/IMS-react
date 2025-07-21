package com.phegondev.InventoryMgtSystem.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import com.phegondev.InventoryMgtSystem.models.ProductQuantity;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TransactionRequest {

   
@NotNull(message = "quantity is required")
@Positive(message = "quantity must be positive")
private Integer quantity;



    private Long supplierId;

    private String description;

    private String note;

    private List<ProductQuantity> products; // nouvelle classe à créer

   public List<Long> getProductIds() {
        if (products == null) return List.of();
        return products.stream()
                .map(ProductQuantity::getProductId)
                .collect(Collectors.toList());
    }
   
}
