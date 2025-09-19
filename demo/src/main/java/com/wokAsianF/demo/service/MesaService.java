package com.wokAsianF.demo.service;

import com.wokAsianF.demo.entity.Mesa;
import com.wokAsianF.demo.repository.MesaRepository;
import com.wokAsianF.demo.DTOs.MesaDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MesaService {
    @Autowired
    private MesaRepository mesaRepository;

    public List<MesaDTO> obtenerTodos() {
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

    public Mesa crear(Mesa mesa) {
        return mesaRepository.save(mesa);
    }

    public Mesa actualizar(Integer id, Mesa mesaActualizada) {
        return mesaRepository.findById(id)
            .map(mesa -> {
                mesa.setNumeroMesa(mesaActualizada.getNumeroMesa());
                mesa.setCapacidad(mesaActualizada.getCapacidad());
                mesa.setUbicacion(mesaActualizada.getUbicacion());
                mesa.setActiva(mesaActualizada.getActiva());
                return mesaRepository.save(mesa);
            }).orElse(null);
    }

    public boolean eliminar(Integer id) {
        if (mesaRepository.existsById(id)) {
            mesaRepository.deleteById(id);
            return true;
        }
        return false;
    }
}