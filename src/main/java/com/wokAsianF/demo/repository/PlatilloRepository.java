package com.wokAsianF.demo.repository;

import com.wokAsianF.demo.entity.Platillo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlatilloRepository extends JpaRepository<Platillo, Integer> {
    List<Platillo> findByCategoria_CategoriaId(Integer categoriaId);
    List<Platillo> findByDisponibleTrue();
}