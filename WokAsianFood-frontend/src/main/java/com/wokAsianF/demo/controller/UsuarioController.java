package com.wokAsianF.demo.controller;

import com.wokAsianF.demo.entity.Usuario;
import com.wokAsianF.demo.DTOs.UsuarioDTO;
import com.wokAsianF.demo.enums.RolUsuario;
import com.wokAsianF.demo.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<Usuario> crear(@RequestBody Usuario usuario) {
        Usuario nuevoUsuario = usuarioService.crear(usuario);
        return ResponseEntity.ok(nuevoUsuario);
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> obtenerTodos(
            @RequestParam(required = false) String rol) {
        RolUsuario rolEnum = null;
        if (rol != null && !rol.isEmpty()) {
            try {
                rolEnum = RolUsuario.valueOf(rol);
            } catch (IllegalArgumentException e) {
                // Si el rol no es válido, se enviará null y se traerán todos
            }
        }
        List<UsuarioDTO> usuarios = usuarioService.obtenerTodos(rolEnum);
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> obtenerPorId(@PathVariable Integer id) {
        return usuarioService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizar(@PathVariable Integer id, @RequestBody Usuario usuario) {
        // Al usar orElseThrow en el servicio, Spring Boot capturará la excepción
        // si no encuentra el usuario y devolverá un 404 (si tienes un @ControllerAdvice)
        // o 500. Ya no es necesario el 'if (usuarioActualizado != null)'.
        Usuario usuarioActualizado = usuarioService.actualizar(id, usuario);
        return ResponseEntity.ok(usuarioActualizado);
    }

    // ----------------------------------------------------
    // ✅ FUNCIÓN DESACTIVAR CORREGIDA
    // La línea 61 de tu antiguo log era donde fallaba.
    // ----------------------------------------------------
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<UsuarioDTO> desactivar(@PathVariable Integer id) {
        // Llama al servicio. Si el usuario no existe, el servicio lanza
        // ResourceNotFoundException, que será manejada por Spring.
        UsuarioDTO usuarioDesactivado = usuarioService.desactivar(id);
        
        // Si todo sale bien, retorna 200 OK con el DTO del usuario
        return ResponseEntity.ok(usuarioDesactivado);
    }
}