package com.wokAsianF.demo.service;

import com.wokAsianF.demo.entity.Usuario; 
import com.wokAsianF.demo.repository.UsuarioRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UserDetailsServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String nombreUsuario) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con nombre: " + nombreUsuario));
        
        // 1. Obtener el nombre del rol del Enum (Ej: "ADMIN" o "USER")
        String rolName = usuario.getRol().name();
        
        // 2. Cargar los roles/autoridades, asegurando que el nombre del rol esté en MAYÚSCULAS.
        // Spring Security requiere el prefijo ROLE_ y el nombre del rol en mayúsculas
        Set<GrantedAuthority> authorities = Collections.singleton(
            new SimpleGrantedAuthority("ROLE_" + rolName.toUpperCase()) // <- CAMBIO CLAVE AQUÍ
        );

        // Retorna un objeto UserDetails de Spring Security
        return new User(
            usuario.getNombreUsuario(), 
            usuario.getPasswordHash(),  
            authorities
        );
    }
}
