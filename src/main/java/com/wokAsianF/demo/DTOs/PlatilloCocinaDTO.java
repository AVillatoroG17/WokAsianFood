package com.wokAsianF.demo.DTOs;

import com.wokAsianF.demo.enums.EstadoPreparacion;
import com.wokAsianF.demo.enums.Prioridad;
import java.time.LocalDateTime;


public class PlatilloCocinaDTO {
private Integer ordenPlatilloId;
private String numeroOrden;
private String numeroMesa;
private String nombrePlatillo;
private Integer cantidad;
private EstadoPreparacion estadoPreparacion;
private Prioridad prioridad;
private String notasPlatillo;
private LocalDateTime horaEnvioCocina;
private String nombreCocineroAsignado;
public PlatilloCocinaDTO() {}
public Integer getOrdenPlatilloId() { return ordenPlatilloId; }
public void setOrdenPlatilloId(Integer ordenPlatilloId) { this.ordenPlatilloId = ordenPlatilloId; }
public String getNumeroOrden() { return numeroOrden; }
public void setNumeroOrden(String numeroOrden) { this.numeroOrden = numeroOrden; }
public String getNumeroMesa() { return numeroMesa; }
public void setNumeroMesa(String numeroMesa) { this.numeroMesa = numeroMesa; }
public String getNombrePlatillo() { return nombrePlatillo; }
public void setNombrePlatillo(String nombrePlatillo) { this.nombrePlatillo = nombrePlatillo; }
public Integer getCantidad() { return cantidad; }
public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
public EstadoPreparacion getEstadoPreparacion() { return estadoPreparacion; }
public void setEstadoPreparacion(EstadoPreparacion estadoPreparacion) { this.estadoPreparacion = estadoPreparacion; }
public Prioridad getPrioridad() { return prioridad; }
public void setPrioridad(Prioridad prioridad) { this.prioridad = prioridad; }
public String getNotasPlatillo() { return notasPlatillo; }
public void setNotasPlatillo(String notasPlatillo) { this.notasPlatillo = notasPlatillo; }
public LocalDateTime getHoraEnvioCocina() { return horaEnvioCocina; }
public void setHoraEnvioCocina(LocalDateTime horaEnvioCocina) { this.horaEnvioCocina = horaEnvioCocina; }
public String getNombreCocineroAsignado() { return nombreCocineroAsignado; }
public void setNombreCocineroAsignado(String nombreCocineroAsignado) { this.nombreCocineroAsignado = nombreCocineroAsignado; }
}