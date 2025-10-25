package com.wokAsianF.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.wokAsianF.demo.DTOs.RegistroDTO;
import com.wokAsianF.demo.DTOs.RegistroResponseDTO;
import com.wokAsianF.demo.DTOs.UsuarioDTO;
import com.wokAsianF.demo.entity.Usuario;
import com.wokAsianF.demo.enums.RolUsuario;
import com.wokAsianF.demo.exception.ResourceNotFoundException; // ⚠️ Necesitarás esta clase
import com.wokAsianF.demo.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // --- Métodos de Listado y Obtención (sin cambios) ---

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

    // --- Métodos de Creación y Registro (sin cambios) ---

    public Usuario crear(Usuario usuario) {
        usuario.setFechaCreacion(LocalDateTime.now());
        return usuarioRepository.save(usuario);
    }

    public RegistroResponseDTO registrar(RegistroDTO registroDTO) {
        // ... (Tu lógica de registro, sin cambios relevantes) ...
        RegistroResponseDTO response = new RegistroResponseDTO();

        if (registroDTO.getNombreUsuario() == null || registroDTO.getNombreUsuario().trim().isEmpty() ||
                registroDTO.getNombreCompleto() == null || registroDTO.getNombreCompleto().trim().isEmpty() ||
                registroDTO.getPassword() == null || registroDTO.getPassword().isEmpty() ||
                registroDTO.getRol() == null) {

            response.setExito(false);
            response.setMensaje("Todos los campos principales (usuario, nombre, password, rol) son obligatorios.");
            return response;
        }

        if (registroDTO.getNombreUsuario().length() < 4 || registroDTO.getPassword().length() < 6) {
            response.setExito(false);
            response.setMensaje("El nombre de usuario debe tener al menos 4 caracteres y la contraseña al menos 6.");
            return response;
        }

        if (usuarioRepository.findByNombreUsuario(registroDTO.getNombreUsuario()).isPresent()) {
            response.setExito(false);
            response.setMensaje("El nombre de usuario ya está en uso.");
            return response;
        }

        if (registroDTO.getEmail() != null && !registroDTO.getEmail().trim().isEmpty()) {
            if (usuarioRepository.findByEmail(registroDTO.getEmail()).isPresent()) {
                response.setExito(false);
                response.setMensaje("El email ya está registrado.");
                return response;
            }
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombreUsuario(registroDTO.getNombreUsuario());
        nuevoUsuario.setNombreCompleto(registroDTO.getNombreCompleto());
        nuevoUsuario.setEmail(registroDTO.getEmail());

        String hashedPassword = passwordEncoder.encode(registroDTO.getPassword());
        nuevoUsuario.setPasswordHash(hashedPassword);

        nuevoUsuario.setRol(registroDTO.getRol());
        nuevoUsuario.setFechaCreacion(LocalDateTime.now());
        nuevoUsuario.setActivo(true);

        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        response.setExito(true);
        response.setMensaje("Usuario registrado exitosamente.");
        response.setUsuarioId(usuarioGuardado.getUsuarioId());

        return response;
    }

    // --- Método de Actualización (sin cambios) ---

    public Usuario actualizar(Integer id, Usuario usuarioActualizado) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setNombreUsuario(usuarioActualizado.getNombreUsuario());
                    usuario.setNombreCompleto(usuarioActualizado.getNombreCompleto());
                    usuario.setEmail(usuarioActualizado.getEmail());

                    if (usuarioActualizado.getPasswordHash() != null
                            && !usuarioActualizado.getPasswordHash().isEmpty()) {
                        usuario.setPasswordHash(usuarioActualizado.getPasswordHash());
                    }

                    usuario.setRol(usuarioActualizado.getRol());
                    usuario.setActivo(usuarioActualizado.getActivo());
                    return usuarioRepository.save(usuario);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id)); // ⬅️ MEJORA: Lanza excepción si no existe
    }

    public UsuarioDTO desactivar(Integer id) { 
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        if (!usuario.getActivo()) {
            return convertirAUsuarioDTO(usuario);
        }

        usuario.setActivo(false);

        Usuario usuarioDesactivado = usuarioRepository.save(usuario);

        return convertirAUsuarioDTO(usuarioDesactivado);
    }
}

