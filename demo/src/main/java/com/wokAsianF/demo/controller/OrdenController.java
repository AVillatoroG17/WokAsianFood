package com.wokAsianF.demo.controller;

import com.wokAsianF.demo.entity.Orden;
import com.wokAsianF.demo.DTOs.OrdenDTO;
import com.wokAsianF.demo.service.OrdenService;
import com.wokAsianF.demo.enums.EstadoOrden;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ordenes")
public class OrdenController {

    @Autowired
    private OrdenService ordenService;

    @PostMapping
    public ResponseEntity<Orden> crear(@RequestBody Orden orden) {
        Orden nuevaOrden = ordenService.crear(orden);
        return ResponseEntity.ok(nuevaOrden);
    }

    @GetMapping
    public ResponseEntity<List<OrdenDTO>> obtenerTodos(
            @RequestParam(required = false) EstadoOrden estado) {
        List<OrdenDTO> ordenes = ordenService.obtenerTodos(estado);
        return ResponseEntity.ok(ordenes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdenDTO> obtenerPorId(@PathVariable Integer id) {
        return ordenService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Orden> actualizar(@PathVariable Integer id, @RequestBody Orden orden) {
        Orden ordenActualizada = ordenService.actualizar(id, orden);
        if (ordenActualizada != null) {
            return ResponseEntity.ok(ordenActualizada);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        if (ordenService.eliminar(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/enviar-cocina")
    public ResponseEntity<Void> enviarACocina(@PathVariable Integer id) {
        if (ordenService.enviarACocina(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    @PostMapping("/{id}/platillos")
public ResponseEntity<Void> agregarPlatillo(@PathVariable Integer id, @RequestBody AgregarPlatilloDTO dto) {
    if (ordenService.agregarPlatillo(id, dto)) {
        return ResponseEntity.ok().build();
    }
    return ResponseEntity.badRequest().build();
}

}
