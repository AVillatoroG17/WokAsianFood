package com.restaurant.api.controller;
import com.restaurant.api.dto.LoginDTO;
import com.restaurant.api.dto.LoginResponseDTO;
import com.restaurant.api.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginDTO loginDTO) {
        LoginResponseDTO response = authService.autenticar(loginDTO);
        if (response.getExito()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body(response);
    }
}

