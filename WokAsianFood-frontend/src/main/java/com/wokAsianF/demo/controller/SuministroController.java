package com.wokAsianF.demo.controller;

import com.wokAsianF.demo.DTOs.SuministroDTO;
import com.wokAsianF.demo.DTOs.SuministroInputDTO;
import com.wokAsianF.demo.service.SuministroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/suministros")
public class SuministroController {

    @Autowired
    private SuministroService suministroService;

    @GetMapping
    public ResponseEntity<List<SuministroDTO>> obtenerTodos(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String categoria) {
        List<SuministroDTO> suministros = suministroService.obtenerTodos(nombre, categoria);
        return ResponseEntity.ok(suministros);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuministroDTO> obtenerPorId(@PathVariable Integer id) {
        return suministroService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SuministroDTO> crear(@RequestBody SuministroInputDTO suministroInputDTO) {
        SuministroDTO nuevoSuministro = suministroService.crear(suministroInputDTO);
        return ResponseEntity.ok(nuevoSuministro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SuministroDTO> actualizar(@PathVariable Integer id, @RequestBody SuministroInputDTO suministroInputDTO) {
        SuministroDTO suministroActualizado = suministroService.actualizar(id, suministroInputDTO);
        if (suministroActualizado != null) {
            return ResponseEntity.ok(suministroActualizado);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        if (suministroService.eliminar(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
