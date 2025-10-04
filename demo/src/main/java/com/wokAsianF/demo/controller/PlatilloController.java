package com.wokAsianF.demo.controller;

import com.wokAsianF.demo.entity.Platillo;
import com.wokAsianF.demo.DTOs.PlatilloDTO;
import com.wokAsianF.demo.service.PlatilloService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/platillos")
public class PlatilloController {

    @Autowired
    private PlatilloService platilloService;

    @PostMapping
    public ResponseEntity<Platillo> crear(@RequestBody Platillo platillo) {
        Platillo nuevoPlatillo = platilloService.crear(platillo);
        return ResponseEntity.ok(nuevoPlatillo);
    }

    @GetMapping
    public ResponseEntity<List<PlatilloDTO>> obtenerTodos(
            @RequestParam(required = false) Integer categoriaId) {
        List<PlatilloDTO> platillos = platilloService.obtenerTodos(categoriaId);
        return ResponseEntity.ok(platillos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlatilloDTO> obtenerPorId(@PathVariable Integer id) {
        return platilloService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Platillo> actualizar(@PathVariable Integer id, @RequestBody Platillo platillo) {
        Platillo platilloActualizado = platilloService.actualizar(id, platillo);
        if (platilloActualizado != null) {
            return ResponseEntity.ok(platilloActualizado);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        if (platilloService.eliminar(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    @PatchMapping("/{id}/disponibilidad")
public ResponseEntity<Void> actualizarDisponibilidad(@PathVariable Integer id, @RequestParam Boolean disponible) {
    if (platilloService.actualizarDisponibilidad(id, disponible)) {
        return ResponseEntity.ok().build();
    }
    return ResponseEntity.notFound().build();
}

}