package com.wokAsianF.demo.controller;

import com.wokAsianF.demo.DTOs.OrdenDTO;
import com.wokAsianF.demo.entity.Orden;
import com.wokAsianF.demo.entity.Pago;
import com.wokAsianF.demo.enums.EstadoOrden;
import com.wokAsianF.demo.repository.OrdenRepository;
import com.wokAsianF.demo.repository.PagoRepository;
import com.wokAsianF.demo.service.OrdenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {
    @Autowired
    private OrdenService ordenService;
    @Autowired
    private OrdenRepository ordenRepository;
    @Autowired
    private PagoRepository pagoRepository;

    @GetMapping("/ordenes-facturables")
    public ResponseEntity<List<OrdenDTO>> getOrdenesFacturables() {
        List<EstadoOrden> estadosFacturables = List.of(
            EstadoOrden.servida, 
            EstadoOrden.lista_para_pago
        );
        List<Orden> ordenes = ordenRepository.findByEstadoOrdenIn(estadosFacturables);
        List<OrdenDTO> ordenesDTO = ordenes.stream()
            .map(orden -> ordenService.convertirAOrdenDTO(orden))
            .collect(Collectors.toList());
        return ResponseEntity.ok(ordenesDTO);
    }

    @PostMapping
    public ResponseEntity<Pago> crearPago(@RequestBody Pago pago) {
        Pago nuevoPago = pagoRepository.save(pago);
        Orden orden = ordenRepository.findById(pago.getOrden().getOrdenId()).orElse(null);
        if (orden != null) {
            orden.setEstadoOrden(EstadoOrden.pagada);
            ordenRepository.save(orden);
        }
        return ResponseEntity.ok(nuevoPago);
    }
}