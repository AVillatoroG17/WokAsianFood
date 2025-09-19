package com.wokAsianF.demo.DTOs;

import java.math.BigDecimal;

public class PlatilloDTO {
    private Integer platilloId;
    private String nombrePlatillo;
    private String nombreCategoria;
    private BigDecimal precioPlatillo;
    private Integer tiempoPreparacion;
    private Boolean disponible;
    private String descripcion;
    private String imagenUrl;

    public PlatilloDTO() {}

    public Integer getPlatilloId() { return platilloId; }
    public void setPlatilloId(Integer platilloId) { this.platilloId = platilloId; }
    public String getNombrePlatillo() { return nombrePlatillo; }
    public void setNombrePlatillo(String nombrePlatillo) { this.nombrePlatillo = nombrePlatillo; }
    public String getNombreCategoria() { return nombreCategoria; }
    public void setNombreCategoria(String nombreCategoria) { this.nombreCategoria = nombreCategoria; }
    public BigDecimal getPrecioPlatillo() { return precioPlatillo; }
    public void setPrecioPlatillo(BigDecimal precioPlatillo) { this.precioPlatillo = precioPlatillo; }
    public Integer getTiempoPreparacion() { return tiempoPreparacion; }
    public void setTiempoPreparacion(Integer tiempoPreparacion) { this.tiempoPreparacion = tiempoPreparacion; }
    public Boolean getDisponible() { return disponible; }
    public void setDisponible(Boolean disponible) { this.disponible = disponible; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
}
