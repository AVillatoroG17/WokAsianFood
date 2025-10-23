package com.wokAsianF.demo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "platillo")
public class Platillo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "platillo_id")
    private Integer platilloId;
    
    @Column(name = "nombre_platillo", nullable = false, length = 100)
    private String nombrePlatillo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private CategoriaPlatillo categoria;
    
    @Column(name = "precio_platillo", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioPlatillo;
    
    @Column(name = "tiempo_preparacion", nullable = false)
    private Integer tiempoPreparacion;
    
    @Column(columnDefinition = "boolean default true")
    private Boolean disponible = true;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "imagen_url", length = 255)
    private String imagenUrl;
    
    @Column(name = "ingredientes_descripcion", columnDefinition = "TEXT")
    private String ingredientesDescripcion;

    public Platillo() {}

    public Integer getPlatilloId() { return platilloId; }
    public void setPlatilloId(Integer platilloId) { this.platilloId = platilloId; }
    public String getNombrePlatillo() { return nombrePlatillo; }
    public void setNombrePlatillo(String nombrePlatillo) { this.nombrePlatillo = nombrePlatillo; }
    public CategoriaPlatillo getCategoria() { return categoria; }
    public void setCategoria(CategoriaPlatillo categoria) { this.categoria = categoria; }
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
