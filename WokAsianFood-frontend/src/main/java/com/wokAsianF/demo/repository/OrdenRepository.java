package com.wokAsianF.demo.repository;

import com.wokAsianF.demo.entity.Orden; // Tu entidad
import com.wokAsianF.demo.enums.EstadoOrden; // Tu Enum
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
// 1. CORRECCIÓN ID: Cambiado de Long a Integer para coincidir con el uso en tus servicios.
public interface OrdenRepository extends JpaRepository<Orden, Integer> {
    
    // --- MÉTODOS DE LÓGICA DE NEGOCIO (AÑADIDOS para resolver errores de compilación) ---
    
    // 2. CORRECCIÓN: Resuelve: The method findByEstadoOrdenIn(...) is undefined
    List<Orden> findByEstadoOrdenIn(List<EstadoOrden> estados);

    // 3. CORRECCIÓN: Resuelve: The method findByMesaMesaId(...) is undefined
    Orden findByMesaMesaId(Integer mesaId);
    
    // --- METRICAS TOTALES (Consultas de la conversación anterior) ---
    
    @Query("SELECT SUM(o.totalOrden) FROM Orden o WHERE o.estadoOrden = 'PAGADA'")
    BigDecimal calcularTotalVentas();

    @Query("SELECT COUNT(o) FROM Orden o WHERE o.estadoOrden = 'PAGADA'")
    Long contarOrdenesPagadas();
    
}