package com.wokAsianF.demo.repository;

import com.wokAsianF.demo.entity.OrdenPlatillo; // Mantener tu paquete original 'entity'
import com.wokAsianF.demo.enums.EstadoPreparacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrdenPlatilloRepository extends JpaRepository<OrdenPlatillo, Integer> {

    List<OrdenPlatillo> findByEstadoPreparacion(EstadoPreparacion estadoPreparacion);
    List<OrdenPlatillo> findByEstadoPreparacionIn(List<EstadoPreparacion> estados);
    List<OrdenPlatillo> findByOrdenOrdenId(Integer ordenId);
    List<OrdenPlatillo> findByCocineroAsignado_UsuarioIdAndEstadoPreparacion(Integer cocineroId, EstadoPreparacion estadoPreparacion);
    List<OrdenPlatillo> findByOrden_OrdenId(Integer ordenId);
    

    @Query("SELECT COALESCE(SUM(op.cantidad), 0) FROM OrdenPlatillo op JOIN op.orden o WHERE o.estadoOrden = 'PAGADA'")
    Long contarPlatillosVendidos();
    
}