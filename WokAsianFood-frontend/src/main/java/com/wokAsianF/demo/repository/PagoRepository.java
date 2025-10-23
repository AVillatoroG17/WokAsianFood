package com.wokAsianF.demo.repository;

import com.wokAsianF.demo.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {
    
    Optional<Pago> findByOrden_OrdenId(Integer ordenId);
    
    boolean existsByOrden_OrdenId(Integer ordenId);
}