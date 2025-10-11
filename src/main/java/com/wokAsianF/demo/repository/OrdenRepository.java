package com.wokAsianF.demo.repository;

import com.wokAsianF.demo.entity.Orden;
import com.wokAsianF.demo.enums.EstadoOrden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrdenRepository extends JpaRepository<Orden, Integer> {
    List<Orden> findByEstadoOrden(EstadoOrden estadoOrden);
    List<Orden> findByMesaMesaId(Integer mesaId);

    @Query(value = "SELECT o FROM Orden o WHERE CAST(o.estadoOrden AS text) IN :#{#estados.![name()]}")
    List<Orden> findByEstadoOrdenIn(@Param("estados") List<EstadoOrden> estados);
    
    // ===== NUEVOS MÉTODOS PARA ESTADÍSTICAS =====
    
    @Query("SELECT COALESCE(SUM(o.totalOrden), 0) FROM Orden o WHERE o.estadoOrden = 'pagada'")
    BigDecimal calcularTotalVentas();
    
    @Query("SELECT COUNT(o) FROM Orden o WHERE o.fechaOrden >= :fechaInicio")
    Long contarOrdenesPorFecha(@Param("fechaInicio") LocalDateTime fechaInicio);
    
    @Query("SELECT COALESCE(SUM(o.totalOrden), 0) FROM Orden o WHERE o.fechaOrden >= :fechaInicio AND o.estadoOrden = 'pagada'")
    BigDecimal calcularVentasPorFecha(@Param("fechaInicio") LocalDateTime fechaInicio);
    
    @Query("SELECT COUNT(o) FROM Orden o WHERE o.estadoOrden = 'pagada'")
    Long contarOrdenesPagadas();
}