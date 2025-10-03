package com.wokAsianF.demo.repository;

import com.wokAsianF.demo.entity.OrdenPlatillo;
import com.wokAsianF.demo.enums.EstadoPreparacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrdenPlatilloRepository extends JpaRepository<OrdenPlatillo, Integer> {
    List<OrdenPlatillo> findByEstadoPreparacion(EstadoPreparacion estadoPreparacion);
    List<OrdenPlatillo> findByOrdenOrdenId(Integer ordenId);
    List<OrdenPlatillo> findByCocineroAsignado_UsuarioIdAndEstadoPreparacion(Integer cocineroId, EstadoPreparacion estadoPreparacion);
    List<OrdenPlatillo> findByOrden_OrdenId(Integer ordenId);
}
