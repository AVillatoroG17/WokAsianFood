package com.wokAsianF.demo.repository;

import com.wokAsianF.demo.entity.Usuario;
import com.wokAsianF.demo.enums.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    List<Usuario> findByRol(RolUsuario rol);
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByNombreCompleto(String nombreCompleto);
}