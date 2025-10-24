package com.wokAsianF.demo.controller;

import com.wokAsianF.demo.entity.Mesa;
import com.wokAsianF.demo.DTOs.MesaDTO;
import com.wokAsianF.demo.service.MesaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus; // ✅ Importar HttpStatus
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/mesas")
public class MesaController {

    @Autowired
    private MesaService mesaService;

    // 1. CREAR MESA (POST) - Añadido manejo de error para duplicados
    @PostMapping
    public ResponseEntity<Mesa> crear(@RequestBody Mesa mesa) {
        try {
            Mesa nuevaMesa = mesaService.crear(mesa);
            // ✅ Usar 201 CREATED para indicar la creación de un nuevo recurso
            return new ResponseEntity<>(nuevaMesa, HttpStatus.CREATED); 
        } catch (IllegalArgumentException e) {
            // ✅ Captura la excepción de duplicado y devuelve 400 Bad Request
            // Puedes incluir el mensaje de error si el frontend lo necesita:
            // return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
            return ResponseEntity.badRequest().build(); 
        }
    }

    @GetMapping
    public ResponseEntity<List<MesaDTO>> obtenerTodos() {
        List<MesaDTO> mesas = mesaService.obtenerTodos();
        return ResponseEntity.ok(mesas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MesaDTO> obtenerPorId(@PathVariable Integer id) {
        return mesaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 2. ACTUALIZAR MESA (PUT) - Añadido manejo de error para duplicados
    @PutMapping("/{id}")
    public ResponseEntity<Mesa> actualizar(@PathVariable Integer id, @RequestBody Mesa mesa) {
        try {
            Mesa mesaActualizada = mesaService.actualizar(id, mesa);
            if (mesaActualizada != null) {
                return ResponseEntity.ok(mesaActualizada);
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
             // ✅ Captura la excepción si el nuevo número de mesa ya existe
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        if (mesaService.eliminar(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}