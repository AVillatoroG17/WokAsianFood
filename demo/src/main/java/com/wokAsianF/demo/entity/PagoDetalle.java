package com.wokAsianF.demo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "pago_detalle")
public class PagoDetalle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pago_detalle_id")
    private Integer pagoDetalleId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pago_id", nullable = false)
    private Pago pago;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_platillo_id", nullable = false)
    private OrdenPlatillo ordenPlatillo;
    
    @Column(name = "cantidad_asignada", nullable = false)
    private Integer cantidadAsignada;
    
    @Column(name = "monto_asignado", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoAsignado;
    
    @Column(name = "persona_numero")
    private Integer personaNumero;
    
    @Column(name = "nombre_persona", length = 100)
    private String nombrePersona;

    public PagoDetalle() {}

    public Integer getPagoDetalleId() { return pagoDetalleId; }
    public void setPagoDetalleId(Integer pagoDetalleId) { this.pagoDetalleId = pagoDetalleId; }
    public Pago getPago() { return pago; }
    public void setPago(Pago pago) { this.pago = pago; }
    public OrdenPlatillo getOrdenPlatillo() { return ordenPlatillo; }
    public void setOrdenPlatillo(OrdenPlatillo ordenPlatillo) { this.ordenPlatillo = ordenPlatillo; }
    public Integer getCantidadAsignada() { return cantidadAsignada; }
    public void setCantidadAsignada(Integer cantidadAsignada) { this.cantidadAsignada = cantidadAsignada; }
    public BigDecimal getMontoAsignado() { return montoAsignado; }
    public void setMontoAsignado(BigDecimal montoAsignado) { this.montoAsignado = montoAsignado; }
    public Integer getPersonaNumero() { return personaNumero; }
    public void setPersonaNumero(Integer personaNumero) { this.personaNumero = personaNumero; }
    public String getNombrePersona() { return nombrePersona; }
    public void setNombrePersona(String nombrePersona) { this.nombrePersona = nombrePersona; }
}
