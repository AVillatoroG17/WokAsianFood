package com.wokAsianF.demo.repository;

import com.wokAsianF.demo.entity.Orden;
import com.wokAsianF.demo.enums.EstadoOrden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrdenRepository extends JpaRepository<Orden, Integer> {
    List<Orden> findByEstadoOrden(EstadoOrden estadoOrden);
    List<Orden> findByMesaMesaId(Integer mesaId);
}