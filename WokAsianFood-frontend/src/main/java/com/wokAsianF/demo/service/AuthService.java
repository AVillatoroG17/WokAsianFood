package com.wokAsianF.demo.service;

import com.wokAsianF.demo.DTOs.LoginDTO;
import com.wokAsianF.demo.DTOs.LoginResponseDTO;
import com.wokAsianF.demo.DTOs.RegistroDTO;
import com.wokAsianF.demo.DTOs.RegistroResponseDTO;
import com.wokAsianF.demo.entity.Usuario;
import com.wokAsianF.demo.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public RegistroResponseDTO registrarNuevoUsuario(RegistroDTO registroDTO) {
        return usuarioService.registrar(registroDTO);
    }

    public LoginResponseDTO autenticar(LoginDTO loginDTO) {
        LoginResponseDTO response = new LoginResponseDTO();

        Usuario usuario = usuarioRepository.findByNombreUsuario(loginDTO.getNombreUsuario())
            .orElseThrow(() -> {
                throw new UsernameNotFoundException("Usuario no encontrado.");
            });

        if (!usuario.getActivo()) {
            response.setExito(false);
            response.setMensaje("Usuario inactivo");
            return response;
        }

        if (!passwordEncoder.matches(loginDTO.getPassword(), usuario.getPasswordHash())) {
            response.setExito(false);
            response.setMensaje("Contraseña incorrecta");
            return response;
        }

        String token = jwtService.generateToken(
            usuario.getUsuarioId(),
            usuario.getNombreUsuario(),
            usuario.getNombreCompleto(),
            usuario.getRol().name()
        );

        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        response.setExito(true);
        response.setMensaje("Login exitoso");
        response.setUsuarioId(usuario.getUsuarioId());
        response.setNombreUsuario(usuario.getNombreUsuario());
        response.setNombreCompleto(usuario.getNombreCompleto());
        response.setRol(usuario.getRol());
        response.setToken(token);

        return response;
    }
}
