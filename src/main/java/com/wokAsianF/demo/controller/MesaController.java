package com.wokAsianF.demo.controller;

import com.wokAsianF.demo.entity.Mesa;
import com.wokAsianF.demo.DTOs.MesaDTO;
import com.wokAsianF.demo.service.MesaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/mesas")
public class MesaController {

    @Autowired
    private MesaService mesaService;

    @PostMapping
    public ResponseEntity<Mesa> crear(@RequestBody Mesa mesa) {
        Mesa nuevaMesa = mesaService.crear(mesa);
        return ResponseEntity.ok(nuevaMesa);
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

    @PutMapping("/{id}")
    public ResponseEntity<Mesa> actualizar(@PathVariable Integer id, @RequestBody Mesa mesa) {
        Mesa mesaActualizada = mesaService.actualizar(id, mesa);
        if (mesaActualizada != null) {
            return ResponseEntity.ok(mesaActualizada);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        if (mesaService.eliminar(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}