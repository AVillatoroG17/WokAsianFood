package com.wokAsianF.demo.DTOs;

import java.math.BigDecimal;
import com.wokAsianF.demo.enums.MetodoPago;
import com.wokAsianF.demo.enums.TipoPago;

public class PagoRequestDTO {
    private Integer ordenId;
    private Integer cajeroId;
    private MetodoPago metodoPago;
    private TipoPago tipoPago;
    private BigDecimal montoEfectivo;
    private BigDecimal montoTarjeta;
    private String referenciaTransaccion;
    private String notasPago;

    public Integer getOrdenId() {
        return ordenId;
    }

    public void setOrdenId(Integer ordenId) {
        this.ordenId = ordenId;
    }

    public Integer getCajeroId() {
        return cajeroId;
    }

    public void setCajeroId(Integer cajeroId) {
        this.cajeroId = cajeroId;
    }

    public MetodoPago getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(MetodoPago metodoPago) {
        this.metodoPago = metodoPago;
    }

    public TipoPago getTipoPago() {
        return tipoPago;
    }

    public void setTipoPago(TipoPago tipoPago) {
        this.tipoPago = tipoPago;
    }

    public BigDecimal getMontoEfectivo() {
        return montoEfectivo;
    }

    public void setMontoEfectivo(BigDecimal montoEfectivo) {
        this.montoEfectivo = montoEfectivo;
    }

    public BigDecimal getMontoTarjeta() {
        return montoTarjeta;
    }

    public void setMontoTarjeta(BigDecimal montoTarjeta) {
        this.montoTarjeta = montoTarjeta;
    }

    public String getReferenciaTransaccion() {
        return referenciaTransaccion;
    }

    public void setReferenciaTransaccion(String referenciaTransaccion) {
        this.referenciaTransaccion = referenciaTransaccion;
    }

    public String getNotasPago() {
        return notasPago;
    }

    public void setNotasPago(String notasPago) {
        this.notasPago = notasPago;
    }

}