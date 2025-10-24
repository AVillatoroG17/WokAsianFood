package com.wokAsianF.demo.service;

import java.math.RoundingMode;
import com.wokAsianF.demo.entity.Pago;
import com.wokAsianF.demo.entity.Orden;
import com.wokAsianF.demo.entity.Usuario;
import com.wokAsianF.demo.repository.PagoRepository;
import com.wokAsianF.demo.repository.OrdenRepository;
import com.wokAsianF.demo.repository.UsuarioRepository;
import com.wokAsianF.demo.enums.EstadoOrden;
import com.wokAsianF.demo.enums.MetodoPago;
import com.wokAsianF.demo.enums.TipoPago;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class PagoService {

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private OrdenRepository ordenRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Pago procesarPago(Integer ordenId, Integer cajeroId,
            MetodoPago metodoPago, TipoPago tipoPago,
            BigDecimal montoEfectivo, BigDecimal montoTarjeta,
            String referenciaTransaccion, String notasPago) {

        Orden orden = ordenRepository.findById(ordenId)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada con ID: " + ordenId));

        if (orden.getEstadoOrden() == EstadoOrden.pagada) {
            throw new IllegalStateException("La orden ya fue pagada anteriormente");
        }

        if (orden.getEstadoOrden() == EstadoOrden.cancelada) {
            throw new IllegalStateException("No se puede pagar una orden cancelada");
        }

        Usuario cajero = usuarioRepository.findById(cajeroId)
                .orElseThrow(() -> new IllegalArgumentException("Cajero no encontrado con ID: " + cajeroId));

        Pago pago = new Pago();
        pago.setOrden(orden);
        pago.setCajero(cajero);
        pago.setTipoPago(tipoPago);
        pago.setMetodoPago(metodoPago);
        pago.setMontoSubtotal(orden.getSubtotal());
        pago.setMontoImpuestos(orden.getImpuestos());
        pago.setMontoDescuento(orden.getDescuento());
        pago.setMontoTotal(orden.getTotalOrden());
        pago.setFechaPago(java.time.Instant.now());
        pago.setReferenciaTransaccion(referenciaTransaccion);
        pago.setNotasPago(notasPago);

        if (metodoPago == MetodoPago.efectivo) {
            pago.setMontoEfectivo(montoEfectivo != null ? montoEfectivo : orden.getTotalOrden());
            pago.setMontoTarjeta(BigDecimal.ZERO);

            BigDecimal cambio = pago.getMontoEfectivo().subtract(orden.getTotalOrden());
            pago.setCambio(cambio.compareTo(BigDecimal.ZERO) > 0 ? cambio : BigDecimal.ZERO);

        } else if (metodoPago == MetodoPago.tarjeta) {
            pago.setMontoEfectivo(BigDecimal.ZERO);
            pago.setMontoTarjeta(orden.getTotalOrden());
            pago.setCambio(BigDecimal.ZERO);

        } else if (metodoPago == MetodoPago.mixto) {
            pago.setMontoEfectivo(montoEfectivo != null ? montoEfectivo : BigDecimal.ZERO);
            pago.setMontoTarjeta(montoTarjeta != null ? montoTarjeta : BigDecimal.ZERO);

            BigDecimal sumaPagos = pago.getMontoEfectivo().add(pago.getMontoTarjeta());
            if (sumaPagos.compareTo(orden.getTotalOrden()) < 0) {
                throw new IllegalArgumentException("El monto total pagado es insuficiente");
            }

            BigDecimal cambio = sumaPagos.subtract(orden.getTotalOrden());
            pago.setCambio(cambio.compareTo(BigDecimal.ZERO) > 0 ? cambio : BigDecimal.ZERO);
        }

        if (tipoPago == TipoPago.dividido && orden.getNumeroPersonas() > 0) {
            BigDecimal montoPorPersona = orden.getTotalOrden()
                    .divide(BigDecimal.valueOf(orden.getNumeroPersonas()), 2, RoundingMode.HALF_UP);
            pago.setMontoPorPersona(montoPorPersona);
        }

        orden.setEstadoOrden(EstadoOrden.pagada);

        ordenRepository.save(orden);

        Pago pagoGuardado = pagoRepository.save(pago);

        return pagoGuardado;
    }

    public boolean puedeSerPagada(Integer ordenId) {
        return ordenRepository.findById(ordenId)
                .map(orden -> orden.getEstadoOrden() != EstadoOrden.pagada
                        && orden.getEstadoOrden() != EstadoOrden.cancelada)
                .orElse(false);
    }

    public Pago obtenerPagoPorOrden(Integer ordenId) {
        throw new UnsupportedOperationException("Método no implementado aún");
    }
}