package com.wokAsianF.demo.DTOs;

import com.wokAsianF.demo.enums.UbicacionMesa;

public class MesaDTO {
    private Integer mesaId;
    private String numeroMesa;
    private Integer capacidad;
    private UbicacionMesa ubicacion;
    private Boolean activa;

    public MesaDTO() {}

    public Integer getMesaId() { return mesaId; }
    public void setMesaId(Integer mesaId) { this.mesaId = mesaId; }
    public String getNumeroMesa() { return numeroMesa; }
    public void setNumeroMesa(String numeroMesa) { this.numeroMesa = numeroMesa; }
    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }
    public UbicacionMesa getUbicacion() { return ubicacion; }
    public void setUbicacion(UbicacionMesa ubicacion) { this.ubicacion = ubicacion; }
    public Boolean getActiva() { return activa; }
    public void setActiva(Boolean activa) { this.activa = activa; }
}

