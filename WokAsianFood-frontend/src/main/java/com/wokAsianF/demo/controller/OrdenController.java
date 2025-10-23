package com.wokAsianF.demo.controller;

import com.wokAsianF.demo.entity.Orden;
import com.wokAsianF.demo.DTOs.OrdenDTO;
import com.wokAsianF.demo.DTOs.OrdenInputDTO; 
import com.wokAsianF.demo.DTOs.AgregarPlatilloDTO; 
import com.wokAsianF.demo.service.OrdenService;
import com.wokAsianF.demo.enums.EstadoOrden;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;
import com.wokAsianF.demo.enums.EstadoPreparacion;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/ordenes")
public class OrdenController {

    @Autowired
    private OrdenService ordenService;

    @PostMapping
    public ResponseEntity<OrdenDTO> crear(@RequestBody OrdenInputDTO ordenInputDTO) {
        OrdenDTO nuevaOrden = ordenService.crear(ordenInputDTO);
        return ResponseEntity.ok(nuevaOrden);
    }

    @GetMapping
    public ResponseEntity<List<OrdenDTO>> obtenerTodos(
            @RequestParam(required = false) String estados,
            @RequestParam(required = false) Integer mesaId) {
        List<EstadoOrden> listaEstados = null;
        if (estados != null && !estados.isEmpty()) {
            listaEstados = Arrays.stream(estados.split(","))
                                 .map(String::trim)
                                 .map(EstadoOrden::valueOf)
                                 .collect(Collectors.toList());
        }
        List<OrdenDTO> ordenes = ordenService.obtenerTodos(listaEstados, mesaId);
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
    
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Void> actualizarEstado(@PathVariable Integer id, @RequestParam EstadoOrden nuevoEstado) {
        if (ordenService.actualizarEstadoOrden(id, nuevoEstado)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }
    
    @PostMapping("/{id}/platillos")
    public ResponseEntity<Void> agregarPlatillo(@PathVariable Integer id, @RequestBody AgregarPlatilloDTO dto) {
        if (ordenService.agregarPlatillo(id, dto)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

    @PatchMapping("/platillo/{ordenPlatilloId}/estado")
    public ResponseEntity<Void> actualizarEstadoPlatillo(
            @PathVariable Integer ordenPlatilloId,
            @RequestParam EstadoPreparacion nuevoEstado,
            @RequestParam(required = false) Integer cocineroId) {
        if (ordenService.actualizarEstadoPlatilloOrden(ordenPlatilloId, nuevoEstado, cocineroId)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }
}