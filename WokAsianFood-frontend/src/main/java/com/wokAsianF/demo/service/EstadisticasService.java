package com.wokAsianF.demo.service;

import com.wokAsianF.demo.DTOs.EstadisticasDTO;
import com.wokAsianF.demo.repository.OrdenRepository;
import com.wokAsianF.demo.repository.OrdenPlatilloRepository;
import com.wokAsianF.demo.repository.ClienteRepository;
import com.wokAsianF.demo.repository.PagoRepository; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.Instant;

@Service
public class EstadisticasService {
    
    // Configura tu zona horaria real aquí
    private static final ZoneId ZONE_ID_NEGOCIO = ZoneId.of("America/Guatemala"); 
    
    @Autowired
    private OrdenRepository ordenRepository;
    
    @Autowired
    private OrdenPlatilloRepository ordenPlatilloRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private PagoRepository pagoRepository; 

    public EstadisticasDTO obtenerEstadisticas() {
        EstadisticasDTO estadisticas = new EstadisticasDTO();
        
        // --- 1. CÁLCULOS HISTÓRICOS (Usando consultas corregidas) ---
        
        BigDecimal totalVentas = ordenRepository.calcularTotalVentas();
        estadisticas.setTotalVentas(totalVentas != null ? totalVentas : BigDecimal.ZERO);
        
        Long totalOrdenes = ordenRepository.contarOrdenesPagadas();
        estadisticas.setTotalOrdenes(totalOrdenes != null ? totalOrdenes.intValue() : 0);
        
        Long platillosVendidos = ordenPlatilloRepository.contarPlatillosVendidos();
        estadisticas.setPlatillosVendidos(platillosVendidos != null ? platillosVendidos.intValue() : 0);
        
        // Asumiendo que esta consulta es correcta y devuelve 0, como indica la DB
        Long clientesActivos = clienteRepository.contarClientesActivos();
        estadisticas.setClientesActivos(clientesActivos != null ? clientesActivos.intValue() : 0);
        
        // --- 2. CÁLCULOS DE HOY ---
        
        ZonedDateTime inicioDiaZoned = ZonedDateTime.now(ZONE_ID_NEGOCIO)
                                                     .toLocalDate()
                                                     .atStartOfDay(ZONE_ID_NEGOCIO);
        
        Instant inicioDia = inicioDiaZoned.toInstant();
        
        Long ordenesHoy = pagoRepository.contarPagosPorFecha(inicioDia);
        BigDecimal ventasHoy = pagoRepository.calcularVentasPorFecha(inicioDia);
        
        estadisticas.setOrdenesHoy(ordenesHoy != null ? ordenesHoy.intValue() : 0);
        estadisticas.setVentasHoy(ventasHoy != null ? ventasHoy : BigDecimal.ZERO);
        
        return estadisticas;
    }
}