package com.wokAsianF.demo.service;

import com.wokAsianF.demo.entity.Suministro;
import com.wokAsianF.demo.repository.SuministroRepository;
import com.wokAsianF.demo.DTOs.SuministroDTO;
import com.wokAsianF.demo.DTOs.SuministroInputDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SuministroService {
    @Autowired
    private SuministroRepository suministroRepository;

    public List<SuministroDTO> obtenerTodos(String nombre, String categoria) {
        List<Suministro> suministros;
        if (nombre != null && !nombre.isEmpty()) {
            suministros = suministroRepository.findByNombreContainingIgnoreCase(nombre);
        } else if (categoria != null && !categoria.isEmpty()) {
            suministros = suministroRepository.findByCategoria(categoria);
        } else {
            suministros = suministroRepository.findAll();
        }
        return suministros.stream()
                .map(this::convertirASuministroDTO)
                .collect(Collectors.toList());
    }

    public Optional<SuministroDTO> obtenerPorId(Integer id) {
        return suministroRepository.findById(id)
                .map(this::convertirASuministroDTO);
    }

    public SuministroDTO crear(SuministroInputDTO suministroInputDTO) {
        Suministro suministro = new Suministro();
        suministro.setNombre(suministroInputDTO.getNombre());
        suministro.setCategoria(suministroInputDTO.getCategoria());
        suministro.setCantidad(suministroInputDTO.getCantidad());
        suministro.setUnidadMedida(suministroInputDTO.getUnidadMedida());
        suministro.setPrecioUnitario(suministroInputDTO.getPrecioUnitario());
        suministro.setStockMinimo(suministroInputDTO.getStockMinimo());
        suministro.setFechaActualizacion(LocalDateTime.now());

        Suministro nuevoSuministro = suministroRepository.save(suministro);
        return convertirASuministroDTO(nuevoSuministro);
    }

    public SuministroDTO actualizar(Integer id, SuministroInputDTO suministroInputDTO) {
        return suministroRepository.findById(id)
                .map(suministro -> {
                    suministro.setNombre(suministroInputDTO.getNombre());
                    suministro.setCategoria(suministroInputDTO.getCategoria());
                    suministro.setCantidad(suministroInputDTO.getCantidad());
                    suministro.setUnidadMedida(suministroInputDTO.getUnidadMedida());
                    suministro.setPrecioUnitario(suministroInputDTO.getPrecioUnitario());
                    suministro.setStockMinimo(suministroInputDTO.getStockMinimo());
                    suministro.setFechaActualizacion(LocalDateTime.now());
                    return convertirASuministroDTO(suministroRepository.save(suministro));
                }).orElse(null);
    }

    public boolean eliminar(Integer id) {
        if (suministroRepository.existsById(id)) {
            suministroRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private SuministroDTO convertirASuministroDTO(Suministro suministro) {
        SuministroDTO dto = new SuministroDTO();
        dto.setSuministroId(suministro.getSuministroId());
        dto.setNombre(suministro.getNombre());
        dto.setCategoria(suministro.getCategoria());
        dto.setCantidad(suministro.getCantidad());
        dto.setUnidadMedida(suministro.getUnidadMedida());
        dto.setPrecioUnitario(suministro.getPrecioUnitario());
        dto.setStockMinimo(suministro.getStockMinimo());
        dto.setFechaActualizacion(suministro.getFechaActualizacion());
        return dto;
    }
}
