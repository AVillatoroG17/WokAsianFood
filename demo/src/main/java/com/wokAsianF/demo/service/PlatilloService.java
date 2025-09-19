package com.wokAsianF.demo.service;

import com.wokAsianF.demo.entity.Platillo;
import com.wokAsianF.demo.repository.PlatilloRepository;
import com.wokAsianF.demo.DTOs.PlatilloDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PlatilloService {
    @Autowired
    private PlatilloRepository platilloRepository;

    public List<PlatilloDTO> obtenerTodos(Integer categoriaId) {
        List<Platillo> platillos;
        if (categoriaId != null) {
            platillos = platilloRepository.findByCategoria_CategoriaId(categoriaId);
        } else {
            platillos = platilloRepository.findAll();
        }
        return platillos.stream()
                .map(this::convertirAPlatilloDTO)
                .collect(Collectors.toList());
    }

    public Optional<PlatilloDTO> obtenerPorId(Integer id) {
        return platilloRepository.findById(id)
                .map(this::convertirAPlatilloDTO);
    }

    private PlatilloDTO convertirAPlatilloDTO(Platillo platillo) {
        PlatilloDTO dto = new PlatilloDTO();
        dto.setPlatilloId(platillo.getPlatilloId());
        dto.setNombrePlatillo(platillo.getNombrePlatillo());
        dto.setNombreCategoria(platillo.getCategoria().getNombreCategoria());
        dto.setPrecioPlatillo(platillo.getPrecioPlatillo());
        dto.setTiempoPreparacion(platillo.getTiempoPreparacion());
        dto.setDisponible(platillo.getDisponible());
        dto.setDescripcion(platillo.getDescripcion());
        dto.setImagenUrl(platillo.getImagenUrl());
        return dto;
    }

    public Platillo crear(Platillo platillo) {
        return platilloRepository.save(platillo);
    }

    public Platillo actualizar(Integer id, Platillo platilloActualizado) {
        return platilloRepository.findById(id)
            .map(platillo -> {
                platillo.setNombrePlatillo(platilloActualizado.getNombrePlatillo());
                platillo.setCategoria(platilloActualizado.getCategoria());
                platillo.setPrecioPlatillo(platilloActualizado.getPrecioPlatillo());
                platillo.setTiempoPreparacion(platilloActualizado.getTiempoPreparacion());
                platillo.setDisponible(platilloActualizado.getDisponible());
                platillo.setDescripcion(platilloActualizado.getDescripcion());
                platillo.setImagenUrl(platilloActualizado.getImagenUrl());
                platillo.setIngredientesDescripcion(platilloActualizado.getIngredientesDescripcion());
                return platilloRepository.save(platillo);
            }).orElse(null);
    }

    public boolean eliminar(Integer id) {
        if (platilloRepository.existsById(id)) {
            platilloRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
