package com.wokAsianF.demo.service;

import com.wokAsianF.demo.entity.Platillo;
import com.wokAsianF.demo.entity.CategoriaPlatillo;
import com.wokAsianF.demo.repository.PlatilloRepository;
import com.wokAsianF.demo.repository.CategoriaPlatilloRepository;
import com.wokAsianF.demo.DTOs.PlatilloDTO;
import com.wokAsianF.demo.DTOs.PlatilloInputDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PlatilloService {
    @Autowired
    private PlatilloRepository platilloRepository;
    @Autowired
    private CategoriaPlatilloRepository categoriaPlatilloRepository;

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
        // Añadir comprobación de null para la categoría
        dto.setNombreCategoria(platillo.getCategoria() != null ? platillo.getCategoria().getNombreCategoria() : "Sin Categoría");
        dto.setPrecioPlatillo(platillo.getPrecioPlatillo());
        dto.setTiempoPreparacion(platillo.getTiempoPreparacion());
        dto.setDisponible(platillo.getDisponible());
        dto.setDescripcion(platillo.getDescripcion());
        dto.setImagenUrl(platillo.getImagenUrl());
        return dto;
    }

    public PlatilloDTO crear(PlatilloInputDTO platilloInputDTO) {
        Platillo platillo = new Platillo();
        // Asignar propiedades del DTO a la entidad
        platillo.setNombrePlatillo(platilloInputDTO.getNombrePlatillo());
        platillo.setPrecioPlatillo(platilloInputDTO.getPrecioPlatillo());
        platillo.setTiempoPreparacion(platilloInputDTO.getTiempoPreparacion());
        platillo.setDisponible(platilloInputDTO.getDisponible());
        platillo.setDescripcion(platilloInputDTO.getDescripcion());
        platillo.setImagenUrl(platilloInputDTO.getImagenUrl());
        platillo.setIngredientesDescripcion(platilloInputDTO.getIngredientesDescripcion());

        // Buscar y asignar la categoría
        CategoriaPlatillo categoria = categoriaPlatilloRepository.findById(platilloInputDTO.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada con ID: " + platilloInputDTO.getCategoriaId()));
        platillo.setCategoria(categoria);

        Platillo nuevoPlatillo = platilloRepository.save(platillo);
        return convertirAPlatilloDTO(nuevoPlatillo);
    }

    public PlatilloDTO actualizar(Integer id, PlatilloInputDTO platilloInputDTO) {
        return platilloRepository.findById(id)
            .map(platillo -> {
                platillo.setNombrePlatillo(platilloInputDTO.getNombrePlatillo());
                // Buscar y asignar la categoría
                CategoriaPlatillo categoria = categoriaPlatilloRepository.findById(platilloInputDTO.getCategoriaId())
                        .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada con ID: " + platilloInputDTO.getCategoriaId()));
                platillo.setCategoria(categoria);

                platillo.setPrecioPlatillo(platilloInputDTO.getPrecioPlatillo());
                platillo.setTiempoPreparacion(platilloInputDTO.getTiempoPreparacion());
                platillo.setDisponible(platilloInputDTO.getDisponible());
                platillo.setDescripcion(platilloInputDTO.getDescripcion());
                platillo.setImagenUrl(platilloInputDTO.getImagenUrl());
                platillo.setIngredientesDescripcion(platilloInputDTO.getIngredientesDescripcion());
                return convertirAPlatilloDTO(platilloRepository.save(platillo));
            }).orElse(null);
    }

    public boolean eliminar(Integer id) {
        if (platilloRepository.existsById(id)) {
            platilloRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public boolean actualizarDisponibilidad(Integer platilloId, Boolean disponible) {
    Optional<Platillo> platilloOpt = platilloRepository.findById(platilloId);
    if (!platilloOpt.isPresent()) {
        return false;
    }
    Platillo platillo = platilloOpt.get();
    platillo.setDisponible(disponible);
    platilloRepository.save(platillo);
    return true;
}
}
