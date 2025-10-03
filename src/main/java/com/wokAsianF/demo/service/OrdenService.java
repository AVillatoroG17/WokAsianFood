package com.wokAsianF.demo.service;

import com.wokAsianF.demo.entity.Orden;
import com.wokAsianF.demo.entity.OrdenPlatillo;
import com.wokAsianF.demo.entity.Platillo; 
import com.wokAsianF.demo.repository.OrdenRepository;
import com.wokAsianF.demo.repository.OrdenPlatilloRepository;
import com.wokAsianF.demo.repository.PlatilloRepository; 
import com.wokAsianF.demo.DTOs.OrdenDTO;
import com.wokAsianF.demo.DTOs.OrdenPlatilloDTO;
import com.wokAsianF.demo.DTOs.AgregarPlatilloDTO; 
import com.wokAsianF.demo.enums.EstadoOrden;
import com.wokAsianF.demo.enums.EstadoPreparacion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.math.BigDecimal; 

@Service
public class OrdenService {
    @Autowired
    private OrdenRepository ordenRepository;
    @Autowired
    private OrdenPlatilloRepository ordenPlatilloRepository;
    
    @Autowired 
    private PlatilloRepository platilloRepository;

    public List<OrdenDTO> obtenerTodos(EstadoOrden estado) {
        List<Orden> ordenes;
        if (estado != null) {
            ordenes = ordenRepository.findByEstadoOrden(estado);
        } else {
            ordenes = ordenRepository.findAll();
        }
        return ordenes.stream()
                .map(this::convertirAOrdenDTO)
                .collect(Collectors.toList());
    }

    public Optional<OrdenDTO> obtenerPorId(Integer id) {
        return ordenRepository.findById(id)
                .map(this::convertirAOrdenDTO);
    }

    private OrdenDTO convertirAOrdenDTO(Orden orden) {
        OrdenDTO dto = new OrdenDTO();
        dto.setOrdenId(orden.getOrdenId());
        dto.setNumeroOrden(orden.getNumeroOrden());
        dto.setNumeroMesa(orden.getMesa() != null ? orden.getMesa().getNumeroMesa() : null);
        dto.setNombreCliente(orden.getCliente() != null ? orden.getCliente().getNombre() : null);
        dto.setNombreMesero(orden.getMesero().getNombreCompleto());
        dto.setFechaOrden(orden.getFechaOrden());
        dto.setTipoOrden(orden.getTipoOrden());
        dto.setEstadoOrden(orden.getEstadoOrden());
        dto.setSubtotal(orden.getSubtotal());
        dto.setImpuestos(orden.getImpuestos());
        dto.setDescuento(orden.getDescuento());
        dto.setTotalOrden(orden.getTotalOrden());
        dto.setNotasGenerales(orden.getNotasGenerales());
        dto.setNumeroPersonas(orden.getNumeroPersonas());
        
        if (orden.getPlatillos() != null) {
            List<OrdenPlatilloDTO> platillosDTO = orden.getPlatillos().stream()
                    .map(this::convertirAOrdenPlatilloDTO)
                    .collect(Collectors.toList());
            dto.setPlatillos(platillosDTO);
        }
        
        return dto;
    }

    private OrdenPlatilloDTO convertirAOrdenPlatilloDTO(OrdenPlatillo ordenPlatillo) {
        OrdenPlatilloDTO dto = new OrdenPlatilloDTO();
        dto.setOrdenPlatilloId(ordenPlatillo.getOrdenPlatilloId());
        dto.setNombrePlatillo(ordenPlatillo.getPlatillo().getNombrePlatillo());
        dto.setCantidad(ordenPlatillo.getCantidad());
        dto.setPrecioUnitario(ordenPlatillo.getPrecioUnitario());
        dto.setSubtotal(ordenPlatillo.getSubtotal());
        dto.setEstadoPreparacion(ordenPlatillo.getEstadoPreparacion());
        dto.setHoraEnvioCocina(ordenPlatillo.getHoraEnvioCocina());
        dto.setHoraInicioPreparacion(ordenPlatillo.getHoraInicioPreparacion());
        dto.setHoraFinPreparacion(ordenPlatillo.getHoraFinPreparacion());
        dto.setNombreCocinero(ordenPlatillo.getCocineroAsignado() != null ? 
                ordenPlatillo.getCocineroAsignado().getNombreCompleto() : null);
        dto.setNotasPlatillo(ordenPlatillo.getNotasPlatillo());
        dto.setPrioridad(ordenPlatillo.getPrioridad());
        return dto;
    }

    public Orden crear(Orden orden) {
        orden.setFechaOrden(LocalDateTime.now());
        return ordenRepository.save(orden);
    }

    public Orden actualizar(Integer id, Orden ordenActualizada) {
        return ordenRepository.findById(id)
            .map(orden -> {
                orden.setMesa(ordenActualizada.getMesa());
                orden.setCliente(ordenActualizada.getCliente());
                orden.setMesero(ordenActualizada.getMesero());
                orden.setTipoOrden(ordenActualizada.getTipoOrden());
                orden.setEstadoOrden(ordenActualizada.getEstadoOrden());
                orden.setSubtotal(ordenActualizada.getSubtotal());
                orden.setImpuestos(ordenActualizada.getImpuestos());
                orden.setDescuento(ordenActualizada.getDescuento());
                orden.setTotalOrden(ordenActualizada.getTotalOrden());
                orden.setNotasGenerales(ordenActualizada.getNotasGenerales());
                orden.setDireccionEntrega(ordenActualizada.getDireccionEntrega());
                orden.setTelefonoContacto(ordenActualizada.getTelefonoContacto());
                orden.setNumeroPersonas(ordenActualizada.getNumeroPersonas());
                return ordenRepository.save(orden);
            }).orElse(null);
    }

    public boolean eliminar(Integer id) {
        if (ordenRepository.existsById(id)) {
            ordenRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public boolean enviarACocina(Integer ordenId) {
        Optional<Orden> ordenOpt = ordenRepository.findById(ordenId);
        if (ordenOpt.isPresent()) {
            Orden orden = ordenOpt.get();
            orden.setEstadoOrden(EstadoOrden.enviada_cocina);
            List<OrdenPlatillo> platillos = ordenPlatilloRepository.findByOrdenOrdenId(ordenId);
            for (OrdenPlatillo platillo : platillos) {
                platillo.setEstadoPreparacion(EstadoPreparacion.pendiente);
                platillo.setHoraEnvioCocina(LocalDateTime.now());
                ordenPlatilloRepository.save(platillo);
            }
            
            ordenRepository.save(orden);
            return true;
        }
        return false;
    }

    public boolean agregarPlatillo(Integer ordenId, AgregarPlatilloDTO dto) {
        Optional<Orden> ordenOpt = ordenRepository.findById(ordenId);
        Optional<Platillo> platilloOpt = platilloRepository.findById(dto.getPlatilloId());
            
        if (!ordenOpt.isPresent() || !platilloOpt.isPresent()) {
            return false;
        }
        Orden orden = ordenOpt.get();
        Platillo platillo = platilloOpt.get();
            
        if (orden.getEstadoOrden() != EstadoOrden.abierta) {
            return false;
        }
        if (!platillo.getDisponible()) {
            return false;
        }
        OrdenPlatillo ordenPlatillo = new OrdenPlatillo();
        ordenPlatillo.setOrden(orden);
        ordenPlatillo.setPlatillo(platillo);
        ordenPlatillo.setCantidad(dto.getCantidad());
        ordenPlatillo.setPrecioUnitario(platillo.getPrecioPlatillo());
            
        BigDecimal subtotal = platillo.getPrecioPlatillo()
            .multiply(BigDecimal.valueOf(dto.getCantidad()));
        ordenPlatillo.setSubtotal(subtotal);
        ordenPlatillo.setNotasPlatillo(dto.getNotasPlatillo());
        ordenPlatillo.setEstadoPreparacion(EstadoPreparacion.pendiente);
            
        ordenPlatilloRepository.save(ordenPlatillo);
        recalcularTotales(orden);
        return true;
    }

    private void recalcularTotales(Orden orden) {
        List<OrdenPlatillo> platillos = ordenPlatilloRepository.findByOrden_OrdenId(orden.getOrdenId());
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrdenPlatillo op : platillos) {
            subtotal = subtotal.add(op.getSubtotal());
        }
        BigDecimal impuestos = subtotal.multiply(BigDecimal.valueOf(0.12));
        BigDecimal total = subtotal.add(impuestos).subtract(orden.getDescuento());
            
        orden.setSubtotal(subtotal);
        orden.setImpuestos(impuestos);
        orden.setTotalOrden(total);
        ordenRepository.save(orden);
    }
}