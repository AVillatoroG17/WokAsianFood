package com.wokAsianF.demo.controller;

import com.wokAsianF.demo.entity.Orden;
import com.wokAsianF.demo.DTOs.OrdenDTO;
import com.wokAsianF.demo.DTOs.OrdenInputDTO;
import com.wokAsianF.demo.DTOs.AgregarPlatilloDTO;
import com.wokAsianF.demo.service.OrdenService;
import com.wokAsianF.demo.service.EstadoOrdenService;
import com.wokAsianF.demo.enums.EstadoOrden;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;
import com.wokAsianF.demo.enums.EstadoPreparacion;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/ordenes")
public class OrdenController {
    @Autowired
    private OrdenService ordenService;
    @Autowired
    private EstadoOrdenService estadoOrdenService;

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MESERO')")
    @PostMapping
    public ResponseEntity<OrdenDTO> crear(@RequestBody OrdenInputDTO ordenInputDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("🔐 Usuario autenticado: " + (auth != null ? auth.getName() : "NULL"));
        System.out.println("🎭 Authorities: " + (auth != null ? auth.getAuthorities() : "NULL"));
        OrdenDTO nuevaOrden = ordenService.crear(ordenInputDTO);
        return ResponseEntity.ok(nuevaOrden);
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MESERO', 'ROLE_COCINERO', 'ROLE_CAJERO', 'ROLE_ENCARGADO')")
    @GetMapping
    public ResponseEntity<List<OrdenDTO>> obtenerTodos(
            @RequestParam(required = false) String estados,
            @RequestParam(required = false) Integer mesaId,
            @RequestParam(required = false) Integer meseroId) {
        List<EstadoOrden> listaEstados = null;
        if (estados != null && !estados.isEmpty()) {
            listaEstados = Arrays.stream(estados.split(","))
                    .map(String::trim)
                    .map(EstadoOrden::valueOf)
                    .collect(Collectors.toList());
        }
        List<OrdenDTO> ordenes = ordenService.obtenerTodos(listaEstados, mesaId);
        if (meseroId != null) {
            ordenes = ordenes.stream()
                    .filter(o -> o.getNombreMesero() != null && 
                                ordenService.obtenerMeseroIdPorNombre(o.getNombreMesero()).equals(meseroId))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(ordenes);
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MESERO', 'ROLE_COCINERO', 'ROLE_CAJERO', 'ROLE_ENCARGADO')")
    @GetMapping("/{id}")
    public ResponseEntity<OrdenDTO> obtenerPorId(@PathVariable Integer id) {
        return ordenService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Orden> actualizar(@PathVariable Integer id, @RequestBody Orden orden) {
        Orden ordenActualizada = ordenService.actualizar(id, orden);
        if (ordenActualizada != null) {
            return ResponseEntity.ok(ordenActualizada);
        }
        return ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        if (ordenService.eliminar(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MESERO')")
    @PatchMapping("/{id}/enviar-cocina")
    public ResponseEntity<Void> enviarACocina(@PathVariable Integer id) {
        if (ordenService.enviarACocina(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Void> actualizarEstado(@PathVariable Integer id, @RequestParam EstadoOrden nuevoEstado) {
        if (ordenService.actualizarEstadoOrden(id, nuevoEstado)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MESERO')")
    @PostMapping("/{id}/platillos")
    public ResponseEntity<Void> agregarPlatillo(@PathVariable Integer id, @RequestBody AgregarPlatilloDTO dto) {
        if (ordenService.agregarPlatillo(id, dto)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_COCINERO')")
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

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MESERO')")
    @PatchMapping("/{id}/servida")
    public ResponseEntity<?> marcarComoServida(
            @PathVariable Integer id,
            @RequestParam Integer meseroId) {
        try {
            estadoOrdenService.marcarComoServida(id, meseroId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Orden marcada como servida"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MESERO')")
    @PatchMapping("/{id}/solicitar-pago")
    public ResponseEntity<?> marcarListaParaPago(@PathVariable Integer id) {
        try {
            estadoOrdenService.marcarListaParaPago(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Orden marcada como lista para pago"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}