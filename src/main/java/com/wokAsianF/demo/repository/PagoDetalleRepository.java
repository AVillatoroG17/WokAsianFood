package com.wokAsianF.demo.repository;

import com.wokAsianF.demo.entity.PagoDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PagoDetalleRepository extends JpaRepository<PagoDetalle, Integer> {
}