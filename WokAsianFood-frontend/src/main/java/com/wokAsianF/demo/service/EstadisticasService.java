package com.wokAsianF.demo.service;

import com.wokAsianF.demo.DTOs.EstadisticasDTO;
import com.wokAsianF.demo.repository.OrdenRepository;
import com.wokAsianF.demo.repository.OrdenPlatilloRepository;
import com.wokAsianF.demo.repository.ClienteRepository;
import com.wokAsianF.demo.repository.PagoRepository; // 🎯 Importar PagoRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.Instant;

@Service
public class EstadisticasService {
    
    // 🎯 Configura tu zona horaria real aquí
    private static final ZoneId ZONE_ID_NEGOCIO = ZoneId.of("America/Guatemala"); 
    
    @Autowired
    private OrdenRepository ordenRepository;
    
    @Autowired
    private OrdenPlatilloRepository ordenPlatilloRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired // 🎯 Inyectar PagoRepository
    private PagoRepository pagoRepository;

    public EstadisticasDTO obtenerEstadisticas() {
        EstadisticasDTO estadisticas = new EstadisticasDTO();
        
        // 1-4. (Cálculos de totales, platillos, clientes... NO CAMBIAN)
        BigDecimal totalVentas = ordenRepository.calcularTotalVentas();
        estadisticas.setTotalVentas(totalVentas != null ? totalVentas : BigDecimal.ZERO);
        
        Long totalOrdenes = ordenRepository.contarOrdenesPagadas();
        estadisticas.setTotalOrdenes(totalOrdenes != null ? totalOrdenes.intValue() : 0);
        
        Long platillosVendidos = ordenPlatilloRepository.contarPlatillosVendidos();
        estadisticas.setPlatillosVendidos(platillosVendidos != null ? platillosVendidos.intValue() : 0);
        
        Long clientesActivos = clienteRepository.contarClientesActivos();
        estadisticas.setClientesActivos(clientesActivos != null ? clientesActivos.intValue() : 0);
        
        // 5. Ventas y órdenes de HOY (Lógica de fecha corregida)
        
        // 🔴 Calculamos la medianoche de HOY en la zona horaria del negocio
        ZonedDateTime inicioDiaZoned = ZonedDateTime.now(ZONE_ID_NEGOCIO)
                                                    .toLocalDate()
                                                    .atStartOfDay(ZONE_ID_NEGOCIO);
        
        Instant inicioDia = inicioDiaZoned.toInstant();
        
        // 🔴 Llamamos a los métodos del PagoRepository, que usa la fecha corregida
        Long ordenesHoy = pagoRepository.contarPagosPorFecha(inicioDia);
        BigDecimal ventasHoy = pagoRepository.calcularVentasPorFecha(inicioDia);
        
        estadisticas.setOrdenesHoy(ordenesHoy != null ? ordenesHoy.intValue() : 0);
        estadisticas.setVentasHoy(ventasHoy != null ? ventasHoy : BigDecimal.ZERO);
        
        return estadisticas;
    }
}