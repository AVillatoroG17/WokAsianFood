package com.wokAsianF.demo.service;

import com.wokAsianF.demo.DTOs.LoginDTO;
import com.wokAsianF.demo.DTOs.LoginResponseDTO;
import com.wokAsianF.demo.DTOs.RegistroDTO;
import com.wokAsianF.demo.DTOs.RegistroResponseDTO;
import com.wokAsianF.demo.entity.Usuario;
import com.wokAsianF.demo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired 
    private UsuarioService usuarioService; 

    public RegistroResponseDTO registrarNuevoUsuario(RegistroDTO registroDTO) {
        return usuarioService.registrar(registroDTO);
    }
    
    public LoginResponseDTO autenticar(LoginDTO loginDTO) {
        LoginResponseDTO response = new LoginResponseDTO();
        Usuario usuario = usuarioRepository.findByNombreUsuario(loginDTO.getNombreUsuario());

        if (usuario == null) {
            response.setExito(false);
            response.setMensaje("Usuario no encontrado");
            return response;
        }
        if (!usuario.getActivo()) {
            response.setExito(false);
            response.setMensaje("Usuario inactivo");
            return response;
        }
        
        if (!usuario.getPasswordHash().equals(loginDTO.getPassword())) {
            response.setExito(false);
            response.setMensaje("Contraseña incorrecta");
            return response;
        }
        
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);
        response.setExito(true);
        response.setMensaje("Login exitoso");
        response.setUsuarioId(usuario.getUsuarioId());
        response.setNombreUsuario(usuario.getNombreUsuario());
        response.setNombreCompleto(usuario.getNombreCompleto());
        response.setRol(usuario.getRol());
        return response;
    }
}