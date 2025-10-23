package com.wokAsianF.demo.controller;

import com.wokAsianF.demo.DTOs.PagoRequestDTO;
import com.wokAsianF.demo.entity.Pago;
import com.wokAsianF.demo.service.PagoService;
import com.wokAsianF.demo.enums.MetodoPago;
import com.wokAsianF.demo.enums.TipoPago;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/pagos")
public class PagoController {

    @Autowired
    private PagoService pagoService;

    /**
     * Endpoint para procesar el pago de una orden
     * 
     * POST /api/pagos
     * Body: {
     *   "ordenId": 1,
     *   "cajeroId": 1,
     *   "metodoPago": "efectivo",
     *   "tipoPago": "grupal",
     *   "montoEfectivo": 100.00,
     *   "montoTarjeta": 0,
     *   "referenciaTransaccion": "REF-12345",
     *   "notasPago": "Pago completo"
     * }
     */

   @PostMapping
public ResponseEntity<?> procesarPago(@RequestBody PagoRequestDTO pagoRequest) { // ¡Cambiamos Map por DTO!
    try {
        // ✅ Todo el código de conversión/casteo desaparece.
        // Spring se encarga de que ya sean los tipos correctos.
        Pago pago = pagoService.procesarPago(
            pagoRequest.getOrdenId(), 
            pagoRequest.getCajeroId(), 
            pagoRequest.getMetodoPago(), 
            pagoRequest.getTipoPago(),
            pagoRequest.getMontoEfectivo(), 
            pagoRequest.getMontoTarjeta(),
            pagoRequest.getReferenciaTransaccion(), 
            pagoRequest.getNotasPago()
        );
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Pago procesado exitosamente",
            "pagoId", pago.getPagoId(),
            "cambio", pago.getCambio()
        ));
        
    } catch (IllegalArgumentException | IllegalStateException e) {
        // ... manejo de errores
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
    } catch (Exception e) {
        // ... manejo de errores 500
        return ResponseEntity.status(500).body(Map.of("success", false, "message", "Error al procesar el pago: " + e.getMessage()));
    }
}
}
