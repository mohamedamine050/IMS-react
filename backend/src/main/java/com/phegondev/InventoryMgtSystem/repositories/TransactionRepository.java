package com.phegondev.InventoryMgtSystem.repositories;

import com.phegondev.InventoryMgtSystem.enums.TransactionStatus;
import com.phegondev.InventoryMgtSystem.enums.TransactionType;
import com.phegondev.InventoryMgtSystem.models.Supplier;
import com.phegondev.InventoryMgtSystem.models.Transaction;

import java.math.BigDecimal;
import java.util.Optional;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    

    

     
   @Query("SELECT SUM(t.totalPrice) FROM Transaction t WHERE t.transactionType = :type AND t.status = :status")
Optional<BigDecimal> sumTotalPriceByTypeAndStatus(TransactionType type,  TransactionStatus status);


     long countByTransactionType(TransactionType sale);

    @Query("SELECT SUM(t.totalPrice) FROM Transaction t WHERE t.transactionType = :type AND t.status = :status")
    BigDecimal sumTotalPriceByTransactionTypeAndStatus(@Param("type") TransactionType type, @Param("status") TransactionStatus status);



	 
}
