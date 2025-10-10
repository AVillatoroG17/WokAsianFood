package com.wokAsianF.demo.service;

import com.wokAsianF.demo.entity.Platillo;
import com.wokAsianF.demo.entity.CategoriaPlatillo;
import com.wokAsianF.demo.repository.PlatilloRepository;
import com.wokAsianF.demo.repository.CategoriaPlatilloRepository;
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

    public Platillo crear(Platillo platillo) {
        // Si el ID es 0, significa que es una nueva entidad y debe ser generado por la DB.
        // Establecerlo a null asegura que Hibernate lo trate como tal.
        if (platillo.getPlatilloId() != null && platillo.getPlatilloId() == 0) {
            platillo.setPlatilloId(null);
        }
        
        // Manejar la asociación con CategoriaPlatillo
        if (platillo.getTempNombreCategoria() != null && !platillo.getTempNombreCategoria().isEmpty()) {
            CategoriaPlatillo categoria = categoriaPlatilloRepository.findByNombreCategoria(platillo.getTempNombreCategoria());
            if (categoria == null) {
                // Si la categoría no existe, crear una nueva
                categoria = new CategoriaPlatillo();
                categoria.setNombreCategoria(platillo.getTempNombreCategoria());
                categoriaPlatilloRepository.save(categoria);
            }
            platillo.setCategoria(categoria);
        } else {
            // Si no se proporciona categoría, o es nula, lanzar excepción o manejar según la lógica de negocio
            // Por ahora, lanzaremos una excepción ya que la categoría es nullable = false
            throw new IllegalArgumentException("La categoría del platillo no puede ser nula.");
        }

        return platilloRepository.save(platillo);
    }

    public Platillo actualizar(Integer id, Platillo platilloActualizado) {
        return platilloRepository.findById(id)
            .map(platillo -> {
                platillo.setNombrePlatillo(platilloActualizado.getNombrePlatillo());
                // Manejar la asociación con CategoriaPlatillo para la actualización
                if (platilloActualizado.getTempNombreCategoria() != null && !platilloActualizado.getTempNombreCategoria().isEmpty()) {
                    CategoriaPlatillo categoria = categoriaPlatilloRepository.findByNombreCategoria(platilloActualizado.getTempNombreCategoria());
                    if (categoria == null) {
                        categoria = new CategoriaPlatillo();
                        categoria.setNombreCategoria(platilloActualizado.getTempNombreCategoria());
                        categoriaPlatilloRepository.save(categoria);
                    }
                    platillo.setCategoria(categoria);
                } else {
                    throw new IllegalArgumentException("La categoría del platillo no puede ser nula.");
                }

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
