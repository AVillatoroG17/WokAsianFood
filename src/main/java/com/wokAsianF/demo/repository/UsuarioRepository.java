package com.wokAsianF.demo.repository;


import com.wokAsianF.demo.entity.Usuario;
import com.wokAsianF.demo.enums.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    List<Usuario> findByRol(RolUsuario rol);
    Usuario findByNombreUsuario(String nombreUsuario);
    Usuario findByEmail(String email);
}
