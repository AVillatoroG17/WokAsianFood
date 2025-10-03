package com.wokAsianF.demo.controller;

import com.wokAsianF.demo.DTOs.LoginDTO;
import com.wokAsianF.demo.DTOs.LoginResponseDTO;
import com.wokAsianF.demo.DTOs.RegistroDTO;
import com.wokAsianF.demo.DTOs.RegistroResponseDTO;
import com.wokAsianF.demo.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/registrar")
    public ResponseEntity<RegistroResponseDTO> registrar(@RequestBody RegistroDTO registroDTO) {
        RegistroResponseDTO response = authService.registrarNuevoUsuario(registroDTO);
        if (response.getExito()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response); 
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginDTO loginDTO) {
        LoginResponseDTO response = authService.autenticar(loginDTO);
        if (response.getExito()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body(response);
    }
}