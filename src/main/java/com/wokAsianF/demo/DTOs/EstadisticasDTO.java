package com.wokAsianF.demo.DTOs;

import java.math.BigDecimal;

public class EstadisticasDTO {
    private BigDecimal totalVentas;
    private Integer totalOrdenes;
    private Integer platillosVendidos;
    private Integer clientesActivos;
    private BigDecimal ventasHoy;
    private Integer ordenesHoy;

    public EstadisticasDTO() {}

    public BigDecimal getTotalVentas() { return totalVentas; }
    public void setTotalVentas(BigDecimal totalVentas) { this.totalVentas = totalVentas; }
    public Integer getTotalOrdenes() { return totalOrdenes; }
    public void setTotalOrdenes(Integer totalOrdenes) { this.totalOrdenes = totalOrdenes; }
    public Integer getPlatillosVendidos() { return platillosVendidos; }
    public void setPlatillosVendidos(Integer platillosVendidos) { this.platillosVendidos = platillosVendidos; }
    public Integer getClientesActivos() { return clientesActivos; }
    public void setClientesActivos(Integer clientesActivos) { this.clientesActivos = clientesActivos; }
    public BigDecimal getVentasHoy() { return ventasHoy; }
    public void setVentasHoy(BigDecimal ventasHoy) { this.ventasHoy = ventasHoy; }
    public Integer getOrdenesHoy() { return ordenesHoy; }
    public void setOrdenesHoy(Integer ordenesHoy) { this.ordenesHoy = ordenesHoy; }
}