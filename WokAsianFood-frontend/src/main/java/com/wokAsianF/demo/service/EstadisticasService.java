package com.wokAsianF.demo.service;

import com.wokAsianF.demo.DTOs.EstadisticasDTO;
import com.wokAsianF.demo.repository.OrdenRepository;
import com.wokAsianF.demo.repository.OrdenPlatilloRepository;
import com.wokAsianF.demo.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class EstadisticasService {
    
    @Autowired
    private OrdenRepository ordenRepository;
    
    @Autowired
    private OrdenPlatilloRepository ordenPlatilloRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;

    public EstadisticasDTO obtenerEstadisticas() {
        EstadisticasDTO estadisticas = new EstadisticasDTO();
        
        // 1. Total de ventas (solo órdenes pagadas)
        BigDecimal totalVentas = ordenRepository.calcularTotalVentas();
        estadisticas.setTotalVentas(totalVentas != null ? totalVentas : BigDecimal.ZERO);
        
        // 2. Total de órdenes pagadas
        Long totalOrdenes = ordenRepository.contarOrdenesPagadas();
        estadisticas.setTotalOrdenes(totalOrdenes != null ? totalOrdenes.intValue() : 0);
        
        // 3. Platillos vendidos (solo de órdenes pagadas)
        Long platillosVendidos = ordenPlatilloRepository.contarPlatillosVendidos();
        estadisticas.setPlatillosVendidos(platillosVendidos != null ? platillosVendidos.intValue() : 0);
        
        // 4. Clientes activos (que tienen al menos una orden)
        Long clientesActivos = clienteRepository.contarClientesActivos();
        estadisticas.setClientesActivos(clientesActivos != null ? clientesActivos.intValue() : 0);
        
        // 5. Ventas y órdenes de HOY
        LocalDateTime inicioDia = LocalDateTime.now().with(LocalTime.MIN);
        
        Long ordenesHoy = ordenRepository.contarOrdenesPorFecha(inicioDia);
        BigDecimal ventasHoy = ordenRepository.calcularVentasPorFecha(inicioDia);
        
        estadisticas.setOrdenesHoy(ordenesHoy != null ? ordenesHoy.intValue() : 0);
        estadisticas.setVentasHoy(ventasHoy != null ? ventasHoy : BigDecimal.ZERO);
        
        return estadisticas;
    }
}