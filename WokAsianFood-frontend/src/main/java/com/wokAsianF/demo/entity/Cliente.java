package com.wokAsianF.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cliente")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cliente_id")
    private Integer clienteId;
    
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(length = 15)
    private String telefono;
    
    @Column(length = 100)
    private String email;
    
    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;
    
    @Column(name = "total_ordenes")
    private Integer totalOrdenes = 0;
    
    @Column(name = "cliente_frecuente", columnDefinition = "boolean default false")
    private Boolean clienteFrecuente = false;

    public Cliente() {}

    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    public Integer getTotalOrdenes() { return totalOrdenes; }
    public void setTotalOrdenes(Integer totalOrdenes) { this.totalOrdenes = totalOrdenes; }
    public Boolean getClienteFrecuente() { return clienteFrecuente; }
    public void setClienteFrecuente(Boolean clienteFrecuente) { this.clienteFrecuente = clienteFrecuente; }
}
