package com.wokAsianF.demo.DTOs;

import java.math.BigDecimal;

public class PlatilloInputDTO {
    private String nombrePlatillo;
    private Integer categoriaId;
    private BigDecimal precioPlatillo;
    private Integer tiempoPreparacion;
    private Boolean disponible;
    private String descripcion;
    private String imagenUrl;
    private String ingredientesDescripcion;

    // Getters y Setters
    public String getNombrePlatillo() { return nombrePlatillo; }
    public void setNombrePlatillo(String nombrePlatillo) { this.nombrePlatillo = nombrePlatillo; }
    public Integer getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Integer categoriaId) { this.categoriaId = categoriaId; }
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
    public String getIngredientesDescripcion() { return ingredientesDescripcion; }
    public void setIngredientesDescripcion(String ingredientesDescripcion) { this.ingredientesDescripcion = ingredientesDescripcion; }
}
