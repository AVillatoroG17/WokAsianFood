package com.wokAsianF.demo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.wokAsianF.demo.enums.MetodoPago;
import com.wokAsianF.demo.enums.TipoPago;

@Entity
@Table(name = "pago")
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pago_id")
    private Integer pagoId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_id", nullable = false)
    private Orden orden;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pago", columnDefinition = "varchar default 'grupal'")
    private TipoPago tipoPago = TipoPago.grupal;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false)
    private MetodoPago metodoPago;
    
    @Column(name = "monto_subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoSubtotal;
    
    @Column(name = "monto_impuestos", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoImpuestos;
    
    @Column(name = "monto_descuento", precision = 10, scale = 2, columnDefinition = "decimal default 0")
    private BigDecimal montoDescuento = BigDecimal.ZERO;
    
    @Column(name = "monto_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTotal;
    
    @Column(name = "monto_por_persona", precision = 10, scale = 2)
    private BigDecimal montoPorPersona;
    
    @Column(name = "monto_efectivo", precision = 10, scale = 2, columnDefinition = "decimal default 0")
    private BigDecimal montoEfectivo = BigDecimal.ZERO;
    
    @Column(name = "monto_tarjeta", precision = 10, scale = 2, columnDefinition = "decimal default 0")
    private BigDecimal montoTarjeta = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2, columnDefinition = "decimal default 0")
    private BigDecimal cambio = BigDecimal.ZERO;
    
    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cajero_id", nullable = false)
    private Usuario cajero;
    
    @Column(name = "referencia_transaccion", length = 100)
    private String referenciaTransaccion;
    
    @Column(name = "notas_pago", columnDefinition = "TEXT")
    private String notasPago;

    public Pago() {}

    public Integer getPagoId() { return pagoId; }
    public void setPagoId(Integer pagoId) { this.pagoId = pagoId; }
    public Orden getOrden() { return orden; }
    public void setOrden(Orden orden) { this.orden = orden; }
    public TipoPago getTipoPago() { return tipoPago; }
    public void setTipoPago(TipoPago tipoPago) { this.tipoPago = tipoPago; }
    public MetodoPago getMetodoPago() { return metodoPago; }
    public void setMetodoPago(MetodoPago metodoPago) { this.metodoPago = metodoPago; }
    public BigDecimal getMontoSubtotal() { return montoSubtotal; }
    public void setMontoSubtotal(BigDecimal montoSubtotal) { this.montoSubtotal = montoSubtotal; }
    public BigDecimal getMontoImpuestos() { return montoImpuestos; }
    public void setMontoImpuestos(BigDecimal montoImpuestos) { this.montoImpuestos = montoImpuestos; }
    public BigDecimal getMontoDescuento() { return montoDescuento; }
    public void setMontoDescuento(BigDecimal montoDescuento) { this.montoDescuento = montoDescuento; }
    public BigDecimal getMontoTotal() { return montoTotal; }
    public void setMontoTotal(BigDecimal montoTotal) { this.montoTotal = montoTotal; }
    public BigDecimal getMontoPorPersona() { return montoPorPersona; }
    public void setMontoPorPersona(BigDecimal montoPorPersona) { this.montoPorPersona = montoPorPersona; }
    public BigDecimal getMontoEfectivo() { return montoEfectivo; }
    public void setMontoEfectivo(BigDecimal montoEfectivo) { this.montoEfectivo = montoEfectivo; }
    public BigDecimal getMontoTarjeta() { return montoTarjeta; }
    public void setMontoTarjeta(BigDecimal montoTarjeta) { this.montoTarjeta = montoTarjeta; }
    public BigDecimal getCambio() { return cambio; }
    public void setCambio(BigDecimal cambio) { this.cambio = cambio; }
    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }
    public Usuario getCajero() { return cajero; }
    public void setCajero(Usuario cajero) { this.cajero = cajero; }
    public String getReferenciaTransaccion() { return referenciaTransaccion; }
    public void setReferenciaTransaccion(String referenciaTransaccion) { this.referenciaTransaccion = referenciaTransaccion; }
    public String getNotasPago() { return notasPago; }
    public void setNotasPago(String notasPago) { this.notasPago = notasPago; }
}