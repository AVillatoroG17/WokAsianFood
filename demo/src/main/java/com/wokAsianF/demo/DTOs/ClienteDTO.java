package com.wokAsianF.demo.DTOs;

import java.time.LocalDateTime;

public class ClienteDTO {
    private Integer clienteId;
    private String nombre;
    private String telefono;
    private String email;
    private LocalDateTime fechaRegistro;
    private Integer totalOrdenes;
    private Boolean clienteFrecuente;

    public ClienteDTO() {}

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
