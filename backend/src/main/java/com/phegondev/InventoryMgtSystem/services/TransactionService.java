package com.phegondev.InventoryMgtSystem.services;

import java.math.BigDecimal;

import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.dtos.TransactionRequest;
import com.phegondev.InventoryMgtSystem.enums.TransactionStatus;
import com.phegondev.InventoryMgtSystem.enums.TransactionType;

public interface TransactionService {
    Response purchase(TransactionRequest transactionRequest);

    Response sell(TransactionRequest transactionRequest);

    Response returnToSupplier(TransactionRequest transactionRequest);

    Response getAllTransactions(int page, int size, String filter);

    Response getAllTransactionById(Long id);

    Response getAllTransactionByMonthAndYear(int month, int year);

    Response updateTransactionStatus(Long transactionId, TransactionStatus status);

    long countSales() ;
    BigDecimal sumTotalPriceByTypeAndStatus(TransactionType type, TransactionStatus status);

    BigDecimal sumTotalPriceByTransactionTypeAndStatus(TransactionType type, TransactionStatus status);

    

    
    


    
}



