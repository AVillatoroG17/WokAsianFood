package com.wokAsianF.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.wokAsianF.demo.DTOs.UsuarioDTO;
import com.wokAsianF.demo.entity.Usuario;
import com.wokAsianF.demo.enums.RolUsuario;
import com.wokAsianF.demo.repository.UsuarioRepository;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<UsuarioDTO> obtenerTodos(RolUsuario rol) {
        List<Usuario> usuarios;
        if (rol != null) {
            usuarios = usuarioRepository.findByRol(rol);
        } else {
            usuarios = usuarioRepository.findAll();
        }
        return usuarios.stream()
                .map(this::convertirAUsuarioDTO)
                .collect(Collectors.toList());
    }

    public Optional<UsuarioDTO> obtenerPorId(Integer id) {
        return usuarioRepository.findById(id)
                .map(this::convertirAUsuarioDTO);
    }

    private UsuarioDTO convertirAUsuarioDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setUsuarioId(usuario.getUsuarioId());
        dto.setNombreUsuario(usuario.getNombreUsuario());
        dto.setNombreCompleto(usuario.getNombreCompleto());
        dto.setEmail(usuario.getEmail());
        dto.setRol(usuario.getRol());
        dto.setActivo(usuario.getActivo());
        dto.setFechaCreacion(usuario.getFechaCreacion());
        dto.setUltimoAcceso(usuario.getUltimoAcceso());
        return dto;
    }

    public Usuario crear(Usuario usuario) {
        usuario.setFechaCreacion(LocalDateTime.now());
        return usuarioRepository.save(usuario);
    }

    public Usuario actualizar(Integer id, Usuario usuarioActualizado) {
        return usuarioRepository.findById(id)
            .map(usuario -> {
                usuario.setNombreUsuario(usuarioActualizado.getNombreUsuario());
                usuario.setNombreCompleto(usuarioActualizado.getNombreCompleto());
                usuario.setEmail(usuarioActualizado.getEmail());
                usuario.setPasswordHash(usuarioActualizado.getPasswordHash());
                usuario.setRol(usuarioActualizado.getRol());
                usuario.setActivo(usuarioActualizado.getActivo());
                return usuarioRepository.save(usuario);
            }).orElse(null);
    }

    public boolean eliminar(Integer id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return true;
        }
        return false;
    }
}