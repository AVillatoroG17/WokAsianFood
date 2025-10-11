package com.wokAsianF.demo.repository;

import com.wokAsianF.demo.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    List<Cliente> findByTelefonoContaining(String telefono);

    @Query("SELECT COUNT(c) FROM Cliente c WHERE c.totalOrdenes > 0")
    Long contarClientesActivos();
}
