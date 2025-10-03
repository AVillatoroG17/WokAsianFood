package com.wokAsianF.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "categoria_platillo")
public class CategoriaPlatillo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "categoria_id")
    private Integer categoriaId;
    
    @Column(name = "nombre_categoria", nullable = false, length = 50)
    private String nombreCategoria;
    
    @Column(name = "orden_preparacion")
    private Integer ordenPreparacion = 1;
    
    @Column(name = "color_identificacion", length = 7)
    private String colorIdentificacion;
    
    @Column(columnDefinition = "boolean default true")
    private Boolean activa = true;

    public CategoriaPlatillo() {}

    public Integer getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Integer categoriaId) { this.categoriaId = categoriaId; }
    public String getNombreCategoria() { return nombreCategoria; }
    public void setNombreCategoria(String nombreCategoria) { this.nombreCategoria = nombreCategoria; }
    public Integer getOrdenPreparacion() { return ordenPreparacion; }
    public void setOrdenPreparacion(Integer ordenPreparacion) { this.ordenPreparacion = ordenPreparacion; }
    public String getColorIdentificacion() { return colorIdentificacion; }
    public void setColorIdentificacion(String colorIdentificacion) { this.colorIdentificacion = colorIdentificacion; }
    public Boolean getActiva() { return activa; }
    public void setActiva(Boolean activa) { this.activa = activa; }
}