package com.wokAsianF.demo.service;

import com.wokAsianF.demo.entity.Mesa;
import com.wokAsianF.demo.repository.MesaRepository;
import com.wokAsianF.demo.DTOs.MesaDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 1. Importar Transaccional
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MesaService {
    @Autowired
    private MesaRepository mesaRepository;

    public List<MesaDTO> obtenerTodos() {
        // Las operaciones de solo lectura no requieren @Transactional
        return mesaRepository.findAll().stream()
                .map(this::convertirAMesaDTO)
                .collect(Collectors.toList());
    }

    public Optional<MesaDTO> obtenerPorId(Integer id) {
        return mesaRepository.findById(id)
                .map(this::convertirAMesaDTO);
    }

    private MesaDTO convertirAMesaDTO(Mesa mesa) {
        MesaDTO dto = new MesaDTO();
        dto.setMesaId(mesa.getMesaId());
        dto.setNumeroMesa(mesa.getNumeroMesa());
        dto.setCapacidad(mesa.getCapacidad());
        dto.setUbicacion(mesa.getUbicacion());
        dto.setActiva(mesa.getActiva());
        return dto;
    }

    // 2. Agregar validación de duplicados y @Transactional
    @Transactional
    public Mesa crear(Mesa mesa) {
        if (mesaRepository.existsByNumeroMesa(mesa.getNumeroMesa())) {
            // Lanza una excepción que será capturada por el Controller para devolver 400
            throw new IllegalArgumentException("El número de mesa '" + mesa.getNumeroMesa() + "' ya existe.");
        }
        return mesaRepository.save(mesa);
    }

    // 3. Agregar @Transactional y validar duplicados en la actualización
    @Transactional
    public Mesa actualizar(Integer id, Mesa mesaActualizada) {
        return mesaRepository.findById(id)
            .map(mesa -> {
                // Validación: Si el número de mesa es diferente Y ya existe, lanzar excepción.
                if (!mesa.getNumeroMesa().equals(mesaActualizada.getNumeroMesa()) && 
                    mesaRepository.existsByNumeroMesa(mesaActualizada.getNumeroMesa())) {
                    
                    throw new IllegalArgumentException("El nuevo número de mesa '" + mesaActualizada.getNumeroMesa() + "' ya está en uso.");
                }

                mesa.setNumeroMesa(mesaActualizada.getNumeroMesa());
                mesa.setCapacidad(mesaActualizada.getCapacidad());
                mesa.setUbicacion(mesaActualizada.getUbicacion());
                mesa.setActiva(mesaActualizada.getActiva());
                return mesaRepository.save(mesa);
            }).orElse(null);
    }

    // 4. Agregar @Transactional
    @Transactional
    public boolean eliminar(Integer id) {
        // 💡 Recomendación: Aquí deberías validar si la mesa tiene órdenes abiertas.
        // Si las tiene, no se debe permitir la eliminación, sino solo desactivarla (setActiva(false)).
        
        if (mesaRepository.existsById(id)) {
            mesaRepository.deleteById(id);
            return true;
        }
        return false;
    }
}