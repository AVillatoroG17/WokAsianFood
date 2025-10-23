package com.wokAsianF.demo.controller;

import com.wokAsianF.demo.DTOs.EstadisticasDTO;
import com.wokAsianF.demo.service.EstadisticasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/v1/estadisticas")
public class EstadisticasController {

    @Autowired
    private EstadisticasService estadisticasService;

    @GetMapping
    public ResponseEntity<EstadisticasDTO> obtenerEstadisticas() {
        EstadisticasDTO estadisticas = estadisticasService.obtenerEstadisticas();
        return ResponseEntity.ok(estadisticas);
    }
}