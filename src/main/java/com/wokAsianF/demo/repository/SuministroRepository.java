package com.wokAsianF.demo.repository;

import com.wokAsianF.demo.entity.Suministro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SuministroRepository extends JpaRepository<Suministro, Integer> {
    List<Suministro> findByNombreContainingIgnoreCase(String nombre);
    List<Suministro> findByCategoria(String categoria);
}
