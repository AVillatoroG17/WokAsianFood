package com.wokAsianF.demo.DTOs;

import com.wokAsianF.demo.enums.TipoOrden;
import java.util.List;
import java.math.BigDecimal; // Asegúrate de tener este import

public class OrdenInputDTO {
    private Integer mesaId;
    private Integer clienteId;
    private Integer meseroId;
    private TipoOrden tipoOrden;
    private String notasGenerales;
    private String direccionEntrega;
    private String telefonoContacto;
    private Integer numeroPersonas;
    private List<AgregarPlatilloDTO> platillos;
    private BigDecimal descuento; // <-- Añadir este campo

    // Getters y Setters
    public Integer getMesaId() { return mesaId; }
    public void setMesaId(Integer mesaId) { this.mesaId = mesaId; }
    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }
    public Integer getMeseroId() { return meseroId; }
    public void setMeseroId(Integer meseroId) { this.meseroId = meseroId; }
    public TipoOrden getTipoOrden() { return tipoOrden; }
    public void setTipoOrden(TipoOrden tipoOrden) { this.tipoOrden = tipoOrden; }
    public String getNotasGenerales() { return notasGenerales; }
    public void setNotasGenerales(String notasGenerales) { this.notasGenerales = notasGenerales; }
    public String getDireccionEntrega() { return direccionEntrega; }
    public void setDireccionEntrega(String direccionEntrega) { this.direccionEntrega = direccionEntrega; }
    public String getTelefonoContacto() { return telefonoContacto; }
    public void setTelefonoContacto(String telefonoContacto) { this.telefonoContacto = telefonoContacto; }
    public Integer getNumeroPersonas() { return numeroPersonas; }
    public void setNumeroPersonas(Integer numeroPersonas) { this.numeroPersonas = numeroPersonas; }
    public List<AgregarPlatilloDTO> getPlatillos() { return platillos; }
    public void setPlatillos(List<AgregarPlatilloDTO> platillos) { this.platillos = platillos; }

    // Añadir getter/setter:
    public BigDecimal getDescuento() { return descuento; }
    public void setDescuento(BigDecimal descuento) { this.descuento = descuento; }
}
