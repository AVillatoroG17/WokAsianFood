package com.wokAsianF.demo.repository;

import com.wokAsianF.demo.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant; // 🎯 Importación clave
import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {
    
    Optional<Pago> findByOrden_OrdenId(Integer ordenId);
    
    boolean existsByOrden_OrdenId(Integer ordenId);
    
    // Contar pagos (órdenes pagadas) desde el inicio del día
    @Query("SELECT COUNT(p) FROM Pago p WHERE p.fechaPago >= :fechaInicio")
    Long contarPagosPorFecha(@Param("fechaInicio") Instant fechaInicio);

    // Sumar el monto total de pagos desde el inicio del día
    @Query("SELECT COALESCE(SUM(p.montoTotal), 0) FROM Pago p WHERE p.fechaPago >= :fechaInicio")
    BigDecimal calcularVentasPorFecha(@Param("fechaInicio") Instant fechaInicio);
}