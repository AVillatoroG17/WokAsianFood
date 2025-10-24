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

@Service
public class EstadoOrdenService {

    @Autowired
    private OrdenRepository ordenRepository;
    
    @Autowired
    private OrdenPlatilloRepository ordenPlatilloRepository;

    /**
     * 🎯 MÉTODO CLAVE: Actualiza el estado de la orden basándose en el progreso de los platillos
     * Se llama automáticamente cada vez que un platillo cambia de estado
     */
    @Transactional
    public void actualizarEstadoAutomatico(Integer ordenId) {
        Orden orden = ordenRepository.findById(ordenId)
            .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
        
        // No procesar si ya está pagada o cancelada
        if (orden.getEstadoOrden() == EstadoOrden.pagada || 
            orden.getEstadoOrden() == EstadoOrden.cancelada) {
            return;
        }
        
        List<OrdenPlatillo> platillos = ordenPlatilloRepository.findByOrden_OrdenId(ordenId);
        
        if (platillos.isEmpty()) {
            return; // No hay platillos, mantener estado actual
        }
        
        // Contar estados de los platillos
        long totalPlatillos = platillos.size();
        long pendientes = platillos.stream()
            .filter(p -> p.getEstadoPreparacion() == EstadoPreparacion.pendiente)
            .count();
        long enCocina = platillos.stream()
            .filter(p -> p.getEstadoPreparacion() == EstadoPreparacion.en_cocina)
            .count();
        long listos = platillos.stream()
            .filter(p -> p.getEstadoPreparacion() == EstadoPreparacion.listo)
            .count();
        
        EstadoOrden nuevoEstado = orden.getEstadoOrden();
        
        // 🔄 LÓGICA DE TRANSICIÓN AUTOMÁTICA
        
        if (orden.getEstadoOrden() == EstadoOrden.enviada_cocina && (enCocina > 0 || listos > 0)) {
            // Si hay al menos un platillo en cocina o listo → en_proceso
            nuevoEstado = EstadoOrden.en_proceso;
        }
        
        if ((orden.getEstadoOrden() == EstadoOrden.en_proceso || 
             orden.getEstadoOrden() == EstadoOrden.enviada_cocina) && 
            listos == totalPlatillos) {
            // Si TODOS los platillos están listos → lista_para_servir
            nuevoEstado = EstadoOrden.lista_para_servir;
        }
        
        // Actualizar solo si cambió
        if (nuevoEstado != orden.getEstadoOrden()) {
            orden.setEstadoOrden(nuevoEstado);
            ordenRepository.save(orden);
            
            System.out.println("✅ Orden #" + ordenId + " cambió de estado: " + 
                             orden.getEstadoOrden() + " → " + nuevoEstado);
        }
    }
    
    /**
     * Marcar una orden como servida (llamado por el mesero)
     */
    @Transactional
    public boolean marcarComoServida(Integer ordenId, Integer meseroId) {
        Orden orden = ordenRepository.findById(ordenId)
            .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
        
        // Solo se puede marcar servida si está lista_para_servir
        if (orden.getEstadoOrden() != EstadoOrden.lista_para_servir) {
            throw new IllegalStateException(
                "La orden debe estar en estado 'lista_para_servir' para marcarla como servida. " +
                "Estado actual: " + orden.getEstadoOrden()
            );
        }
        
        // Verificar que el mesero sea el responsable de la orden
        if (!orden.getMesero().getUsuarioId().equals(meseroId)) {
            throw new IllegalStateException("Solo el mesero responsable puede marcar la orden como servida");
        }
        
        orden.setEstadoOrden(EstadoOrden.servida);
        ordenRepository.save(orden);
        
        // Marcar todos los platillos como servidos
        List<OrdenPlatillo> platillos = ordenPlatilloRepository.findByOrden_OrdenId(ordenId);
        platillos.forEach(p -> {
            if (p.getEstadoPreparacion() == EstadoPreparacion.listo) {
                p.setEstadoPreparacion(EstadoPreparacion.servido);
                p.setHoraServido(java.time.LocalDateTime.now());
            }
        });
        ordenPlatilloRepository.saveAll(platillos);
        
        return true;
    }
}