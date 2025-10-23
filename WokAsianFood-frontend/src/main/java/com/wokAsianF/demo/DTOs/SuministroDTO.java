package com.wokAsianF.demo.DTOs;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SuministroDTO {
    private Integer suministroId;
    private String nombre;
    private String categoria;
    private BigDecimal cantidad;
    private String unidadMedida;
    private BigDecimal precioUnitario;
    private BigDecimal stockMinimo;
    private LocalDateTime fechaActualizacion;

    // Getters y Setters
    public Integer getSuministroId() { return suministroId; }
    public void setSuministroId(Integer suministroId) { this.suministroId = suministroId; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public BigDecimal getCantidad() { return cantidad; }
    public void setCantidad(BigDecimal cantidad) { this.cantidad = cantidad; }
    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }
    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
    public BigDecimal getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(BigDecimal stockMinimo) { this.stockMinimo = stockMinimo; }
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
}
