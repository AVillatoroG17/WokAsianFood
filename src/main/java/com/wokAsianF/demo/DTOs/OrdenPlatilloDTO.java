package com.wokAsianF.demo.DTOs;

import com.wokAsianF.demo.enums.EstadoPreparacion;
import com.wokAsianF.demo.enums.Prioridad;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrdenPlatilloDTO {
    private Integer ordenPlatilloId;
    private String nombrePlatillo;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
    private EstadoPreparacion estadoPreparacion;
    private LocalDateTime horaEnvioCocina;
    private LocalDateTime horaInicioPreparacion;
    private LocalDateTime horaFinPreparacion;
    private String nombreCocinero;
    private String notasPlatillo;
    private Prioridad prioridad;

    public OrdenPlatilloDTO() {}

    public Integer getOrdenPlatilloId() { return ordenPlatilloId; }
    public void setOrdenPlatilloId(Integer ordenPlatilloId) { this.ordenPlatilloId = ordenPlatilloId; }
    public String getNombrePlatillo() { return nombrePlatillo; }
    public void setNombrePlatillo(String nombrePlatillo) { this.nombrePlatillo = nombrePlatillo; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public EstadoPreparacion getEstadoPreparacion() { return estadoPreparacion; }
    public void setEstadoPreparacion(EstadoPreparacion estadoPreparacion) { this.estadoPreparacion = estadoPreparacion; }
    public LocalDateTime getHoraEnvioCocina() { return horaEnvioCocina; }
    public void setHoraEnvioCocina(LocalDateTime horaEnvioCocina) { this.horaEnvioCocina = horaEnvioCocina; }
    public LocalDateTime getHoraInicioPreparacion() { return horaInicioPreparacion; }
    public void setHoraInicioPreparacion(LocalDateTime horaInicioPreparacion) { this.horaInicioPreparacion = horaInicioPreparacion; }
    public LocalDateTime getHoraFinPreparacion() { return horaFinPreparacion; }
    public void setHoraFinPreparacion(LocalDateTime horaFinPreparacion) { this.horaFinPreparacion = horaFinPreparacion; }
    public String getNombreCocinero() { return nombreCocinero; }
    public void setNombreCocinero(String nombreCocinero) { this.nombreCocinero = nombreCocinero; }
    public String getNotasPlatillo() { return notasPlatillo; }
    public void setNotasPlatillo(String notasPlatillo) { this.notasPlatillo = notasPlatillo; }
    public Prioridad getPrioridad() { return prioridad; }
    public void setPrioridad(Prioridad prioridad) { this.prioridad = prioridad; }
}
