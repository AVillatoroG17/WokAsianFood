package com.wokAsianF.demo.controller;

import com.wokAsianF.demo.DTOs.PlatilloCocinaDTO;
import com.wokAsianF.demo.service.CocinaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/cocina")
public class CocinaController {
@Autowired
private CocinaService cocinaService;
@GetMapping("/pendientes")
public ResponseEntity<List<PlatilloCocinaDTO>> obtenerPlatillosPendientes() {
List<PlatilloCocinaDTO> platillos = cocinaService.obtenerPlatillosPendientes();
return ResponseEntity.ok(platillos);
}
@GetMapping("/mis-platillos/{cocineroId}")
public ResponseEntity<List<PlatilloCocinaDTO>> obtenerMisPlatillos(@PathVariable Integer cocineroId) {
List<PlatilloCocinaDTO> platillos = cocinaService.obtenerMisPlatillos(cocineroId);
return ResponseEntity.ok(platillos);
}
@PatchMapping("/platillos/{id}/iniciar")
public ResponseEntity<Void> iniciarPreparacion(@PathVariable Integer id, @RequestParam Integer cocineroId) {
if (cocinaService.iniciarPreparacion(id, cocineroId)) {
return ResponseEntity.ok().build();
}
return ResponseEntity.badRequest().build();
}
@PatchMapping("/platillos/{id}/listo")
public ResponseEntity<Void> marcarListo(@PathVariable Integer id) {
if (cocinaService.marcarListo(id)) {
return ResponseEntity.ok().build();
}
return ResponseEntity.badRequest().build();
}
}