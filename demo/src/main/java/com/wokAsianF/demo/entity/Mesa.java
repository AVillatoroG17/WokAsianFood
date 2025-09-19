package com.wokAsianF.demo.entity;

import com.wokAsianF.demo.enums.UbicacionMesa;
import jakarta.persistence.*;

@Entity
@Table(name = "mesa")
public class Mesa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mesa_id")
    private Integer mesaId;
    
    @Column(name = "numero_mesa", nullable = false, unique = true, length = 10)
    private String numeroMesa;
    
    @Column(columnDefinition = "integer default 4")
    private Integer capacidad = 4;
    
@Enumerated(EnumType.STRING)
    @Column(columnDefinition = "varchar default 'interior'")
    private UbicacionMesa ubicacion = UbicacionMesa.interior;
    
    @Column(columnDefinition = "boolean default true")
    private Boolean activa = true;

    public Mesa() {}

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
