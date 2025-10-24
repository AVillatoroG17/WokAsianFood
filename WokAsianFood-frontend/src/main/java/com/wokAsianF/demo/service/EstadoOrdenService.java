package com.wokAsianF.demo.service;

import com.wokAsianF.demo.entity.Orden;
import com.wokAsianF.demo.entity.OrdenPlatillo;
import com.wokAsianF.demo.repository.OrdenRepository;
import com.wokAsianF.demo.repository.OrdenPlatilloRepository;
import com.wokAsianF.demo.enums.EstadoOrden;
import com.wokAsianF.demo.enums.EstadoPreparacion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.time.LocalDateTime; // ✅ Usamos LocalDateTime para ser consistente con la entidad OrdenPlatillo

@Service
public class EstadoOrdenService {
    @Autowired
    private OrdenRepository ordenRepository;
    @Autowired
    private OrdenPlatilloRepository ordenPlatilloRepository;

    @Transactional
    public void actualizarEstadoAutomatico(Integer ordenId) {
        Orden orden = ordenRepository.findById(ordenId)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
        
        // 1. Evitar cambios en órdenes finales
        if (orden.getEstadoOrden() == EstadoOrden.PAGADA || orden.getEstadoOrden() == EstadoOrden.CANCELADA) {
            return;
        }
        
        List<OrdenPlatillo> platillos = ordenPlatilloRepository.findByOrden_OrdenId(ordenId);
        if (platillos.isEmpty()) {
            return;
        }
        
        long totalPlatillos = platillos.size();
        long enCocina = platillos.stream().filter(p -> p.getEstadoPreparacion() == EstadoPreparacion.EN_COCINA).count();
        long listos = platillos.stream().filter(p -> p.getEstadoPreparacion() == EstadoPreparacion.LISTO).count();
        
        EstadoOrden nuevoEstado = orden.getEstadoOrden();
        
        // 2. Transición: enviada_cocina → en_proceso 
        if (orden.getEstadoOrden() == EstadoOrden.ENVIADA_COCINA && (enCocina > 0 || listos > 0)) {
            nuevoEstado = EstadoOrden.EN_PROCESO;
        }

        // 3. ✅ CORRECCIÓN DE BUG: Transición a lista_para_servir
        // Incluye el estado 'abierta' para que las órdenes que no se movieron de estado inicial (como 38-41) se desbloqueen.
        if ((orden.getEstadoOrden() == EstadoOrden.ABIERTA ||
             orden.getEstadoOrden() == EstadoOrden.EN_PROCESO || 
             orden.getEstadoOrden() == EstadoOrden.ENVIADA_COCINA) 
            && listos == totalPlatillos) {
            
            nuevoEstado = EstadoOrden.LISTA_PARA_SERVIR;
        }
        
        // 4. Guardar el nuevo estado si ha cambiado
        if (nuevoEstado != orden.getEstadoOrden()) {
            orden.setEstadoOrden(nuevoEstado);
            ordenRepository.save(orden);
            System.out.println("✅ Orden #" + ordenId + " cambió de estado: " + orden.getEstadoOrden() + " → " + nuevoEstado);
        }
    }

    @Transactional
    public boolean marcarComoServida(Integer ordenId, Integer meseroId) {
        Orden orden = ordenRepository.findById(ordenId).orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
        
        if (orden.getEstadoOrden() != EstadoOrden.LISTA_PARA_SERVIR) {
            throw new IllegalStateException("La orden debe estar en estado 'lista_para_servir' para marcarla como servida. Estado actual: " + orden.getEstadoOrden());
        }
        
        if (!orden.getMesero().getUsuarioId().equals(meseroId)) {
            throw new IllegalStateException("Solo el mesero responsable puede marcar la orden como servida");
        }
        
        orden.setEstadoOrden(EstadoOrden.SERVIDA);
        ordenRepository.save(orden);
        
        List<OrdenPlatillo> platillos = ordenPlatilloRepository.findByOrden_OrdenId(ordenId);
        
        platillos.forEach(p -> {
            if (p.getEstadoPreparacion() == EstadoPreparacion.LISTO) {
                p.setEstadoPreparacion(EstadoPreparacion.SERVIDO);
                p.setHoraServido(LocalDateTime.now()); // ✅ Consistente con la entidad
            }
        });
        
        ordenPlatilloRepository.saveAll(platillos);
        return true;
    }

    @Transactional
    public boolean marcarListaParaPago(Integer ordenId) {
        Orden orden = ordenRepository.findById(ordenId).orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
        
        if (orden.getEstadoOrden() != EstadoOrden.SERVIDA) {
            throw new IllegalStateException("La orden debe estar en estado 'servida' para enviarla a caja. Estado actual: " + orden.getEstadoOrden());
        }
        
        orden.setEstadoOrden(EstadoOrden.LISTA_PARA_PAGO);
        ordenRepository.save(orden);
        
        return true;
    }
}