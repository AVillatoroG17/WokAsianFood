package com.wokAsianF.demo.repository;

import com.wokAsianF.demo.entity.Usuario;
import com.wokAsianF.demo.enums.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
    /**
     * Busca una lista de usuarios por su rol.
     * @param rol El rol del usuario (del Enum RolUsuario).
     * @return Una lista de usuarios con ese rol.
     */
    List<Usuario> findByRol(RolUsuario rol);
    
    /**
     * Busca un usuario por su nombre de usuario (usado para el login).
     * Retorna un Optional para manejar la ausencia del usuario de forma segura.
     * @param nombreUsuario El nombre de usuario a buscar.
     * @return Un Optional que contiene el Usuario si existe.
     */
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);
    
    /**
     * Busca un usuario por su email.
     * Retorna un Optional para manejar la ausencia del usuario de forma segura.
     * @param email El email a buscar.
     * @return Un Optional que contiene el Usuario si existe.
     */
    Optional<Usuario> findByEmail(String email);
}