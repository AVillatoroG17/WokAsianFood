package com.wokAsianF.demo.service;

import com.wokAsianF.demo.entity.Orden;
import com.wokAsianF.demo.entity.OrdenPlatillo;
import com.wokAsianF.demo.entity.Platillo; 
import com.wokAsianF.demo.repository.OrdenRepository;
import com.wokAsianF.demo.repository.OrdenPlatilloRepository;
import com.wokAsianF.demo.repository.PlatilloRepository; 
import com.wokAsianF.demo.repository.UsuarioRepository; 
import com.wokAsianF.demo.entity.Usuario; 
import com.wokAsianF.demo.entity.Mesa; 
import com.wokAsianF.demo.entity.Cliente; 
import com.wokAsianF.demo.repository.MesaRepository; 
import com.wokAsianF.demo.repository.ClienteRepository; 
import com.wokAsianF.demo.DTOs.OrdenDTO;
import com.wokAsianF.demo.DTOs.OrdenPlatilloDTO;
import com.wokAsianF.demo.DTOs.OrdenInputDTO; 
import com.wokAsianF.demo.DTOs.AgregarPlatilloDTO; 
import com.wokAsianF.demo.enums.EstadoOrden;
import com.wokAsianF.demo.enums.EstadoPreparacion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.math.BigDecimal; 

@Service
public class OrdenService {
    @Autowired
    private OrdenRepository ordenRepository;
    @Autowired
    private OrdenPlatilloRepository ordenPlatilloRepository;
    
    @Autowired 
    private PlatilloRepository platilloRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired // <-- NECESARIO
    private MesaRepository mesaRepository; 
    @Autowired // <-- NECESARIO
    private ClienteRepository clienteRepository;

    public List<OrdenDTO> obtenerTodos(List<EstadoOrden> estados, Integer mesaId) {
        List<Orden> ordenes;
        if (mesaId != null) {
            ordenes = ordenRepository.findByMesaMesaId(mesaId);
        } else if (estados != null && !estados.isEmpty()) {
            ordenes = ordenRepository.findByEstadoOrdenIn(estados);
        } else {
            ordenes = ordenRepository.findAll();
        }
        return ordenes.stream()
                .map(this::convertirAOrdenDTO)
                .collect(Collectors.toList());
    }

    public Optional<OrdenDTO> obtenerPorId(Integer id) {
        return ordenRepository.findById(id)
                .map(this::convertirAOrdenDTO);
    }

    private OrdenDTO convertirAOrdenDTO(Orden orden) {
        OrdenDTO dto = new OrdenDTO();
        dto.setOrdenId(orden.getOrdenId());
        dto.setNumeroOrden(orden.getNumeroOrden());
        dto.setNumeroMesa(orden.getMesa() != null ? orden.getMesa().getNumeroMesa() : null);
        dto.setNombreCliente(orden.getCliente() != null ? orden.getCliente().getNombre() : null);
        dto.setNombreMesero(orden.getMesero().getNombreCompleto());
        dto.setFechaOrden(orden.getFechaOrden());
        dto.setTipoOrden(orden.getTipoOrden());
        dto.setEstadoOrden(orden.getEstadoOrden());
        dto.setSubtotal(orden.getSubtotal());
        dto.setImpuestos(orden.getImpuestos());
        dto.setDescuento(orden.getDescuento());
        dto.setTotalOrden(orden.getTotalOrden());
        dto.setNotasGenerales(orden.getNotasGenerales());
        dto.setNumeroPersonas(orden.getNumeroPersonas());
        
        if (orden.getPlatillos() != null) {
            List<OrdenPlatilloDTO> platillosDTO = orden.getPlatillos().stream()
                    .map(this::convertirAOrdenPlatilloDTO)
                    .collect(Collectors.toList());
            dto.setPlatillos(platillosDTO);
        }
        
        return dto;
    }

    private OrdenPlatilloDTO convertirAOrdenPlatilloDTO(OrdenPlatillo ordenPlatillo) {
        OrdenPlatilloDTO dto = new OrdenPlatilloDTO();
        dto.setOrdenPlatilloId(ordenPlatillo.getOrdenPlatilloId());
        dto.setNombrePlatillo(ordenPlatillo.getPlatillo().getNombrePlatillo());
        dto.setCantidad(ordenPlatillo.getCantidad());
        dto.setPrecioUnitario(ordenPlatillo.getPrecioUnitario());
        dto.setSubtotal(ordenPlatillo.getSubtotal());
        dto.setEstadoPreparacion(ordenPlatillo.getEstadoPreparacion());
        dto.setHoraEnvioCocina(ordenPlatillo.getHoraEnvioCocina());
        dto.setHoraInicioPreparacion(ordenPlatillo.getHoraInicioPreparacion());
        dto.setHoraFinPreparacion(ordenPlatillo.getHoraFinPreparacion());
        dto.setNombreCocinero(ordenPlatillo.getCocineroAsignado() != null ? 
                ordenPlatillo.getCocineroAsignado().getNombreCompleto() : null);
        dto.setNotasPlatillo(ordenPlatillo.getNotasPlatillo());
        dto.setPrioridad(ordenPlatillo.getPrioridad());
        return dto;
    }


 @Transactional
public OrdenDTO crear(OrdenInputDTO ordenInputDTO) {
    Orden nuevaOrden = new Orden();
    
    // Generar y asignar número de orden ANTES de guardar
    String numeroDeOrden = "ORD-" + System.currentTimeMillis();
    nuevaOrden.setNumeroOrden(numeroDeOrden);

    nuevaOrden.setFechaOrden(LocalDateTime.now());
    nuevaOrden.setTipoOrden(ordenInputDTO.getTipoOrden());
    nuevaOrden.setEstadoOrden(EstadoOrden.abierta); 
    nuevaOrden.setNotasGenerales(ordenInputDTO.getNotasGenerales());
    nuevaOrden.setNumeroPersonas(ordenInputDTO.getNumeroPersonas() != null ? ordenInputDTO.getNumeroPersonas() : 1);
    nuevaOrden.setDireccionEntrega(ordenInputDTO.getDireccionEntrega());
    nuevaOrden.setTelefonoContacto(ordenInputDTO.getTelefonoContacto());
    // NOTA: Tu OrdenInputDTO no tiene campo 'descuento'. Asumiendo BigDecimal.ZERO por ahora.
    nuevaOrden.setDescuento(BigDecimal.ZERO); 
    
    // 1. Asignar Mesero (requerido)
    Usuario mesero = usuarioRepository.findById(ordenInputDTO.getMeseroId())
            .orElseThrow(() -> new IllegalArgumentException("Mesero no encontrado con ID: " + ordenInputDTO.getMeseroId()));
    nuevaOrden.setMesero(mesero);

    // 2. Asignar Mesa (opcional, asumiendo mesa_id es opcional)
    if (ordenInputDTO.getMesaId() != null) {
        Mesa mesa = mesaRepository.findById(ordenInputDTO.getMesaId())
            .orElseThrow(() -> new IllegalArgumentException("Mesa no encontrada con ID: " + ordenInputDTO.getMesaId()));
        nuevaOrden.setMesa(mesa);
    }
    
    // 3. Asignar Cliente (opcional, asumiendo cliente_id es opcional)
    if (ordenInputDTO.getClienteId() != null) {
        Cliente cliente = clienteRepository.findById(ordenInputDTO.getClienteId())
            .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado con ID: " + ordenInputDTO.getClienteId()));
        nuevaOrden.setCliente(cliente);
    }

    // Inicializar Totales
    nuevaOrden.setSubtotal(BigDecimal.ZERO);
    nuevaOrden.setImpuestos(BigDecimal.ZERO);
    nuevaOrden.setTotalOrden(BigDecimal.ZERO);

    // Guardar la orden primero para obtener un ID
    Orden savedOrden = ordenRepository.save(nuevaOrden);

    // 4. Agregar platillos iniciales usando el método auxiliar
    if (ordenInputDTO.getPlatillos() != null) {
        for (AgregarPlatilloDTO dto : ordenInputDTO.getPlatillos()) {
            agregarPlatillo(savedOrden.getOrdenId(), dto);
        }
        // Recalcular totales se llama dentro de agregarPlatillo, pero forzamos uno al final
    }
    recalcularTotales(savedOrden);

    // 5. Convertir la entidad guardada al DTO y devolver.
    return convertirAOrdenDTO(savedOrden);
}

    // Este método es una sobrecarga para soportar el DTO de creación,
    // asumiendo que el DTO se convierte a la entidad Orden antes de llamar a crear(Orden)
    // Se ha dejado solo el método con la entidad Orden para simplificar
    
    @Transactional
    public Orden actualizar(Integer id, Orden ordenActualizada) {
        return ordenRepository.findById(id)
            .map(orden -> {
                orden.setMesa(ordenActualizada.getMesa());
                orden.setCliente(ordenActualizada.getCliente());
                orden.setMesero(ordenActualizada.getMesero());
                orden.setTipoOrden(ordenActualizada.getTipoOrden());
                orden.setEstadoOrden(ordenActualizada.getEstadoOrden());
                orden.setSubtotal(ordenActualizada.getSubtotal());
                orden.setImpuestos(ordenActualizada.getImpuestos());
                orden.setDescuento(ordenActualizada.getDescuento());
                orden.setTotalOrden(ordenActualizada.getTotalOrden());
                orden.setNotasGenerales(ordenActualizada.getNotasGenerales());
                orden.setDireccionEntrega(ordenActualizada.getDireccionEntrega());
                orden.setTelefonoContacto(ordenActualizada.getTelefonoContacto());
                orden.setNumeroPersonas(ordenActualizada.getNumeroPersonas());
                
                // Falta lógica para actualizar platillos individualmente.

                recalcularTotales(orden);
                return ordenRepository.save(orden);
            }).orElse(null);
    }

    public boolean eliminar(Integer id) {
        if (ordenRepository.existsById(id)) {
            ordenRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public boolean enviarACocina(Integer ordenId) {
        Optional<Orden> ordenOpt = ordenRepository.findById(ordenId);
        if (ordenOpt.isPresent()) {
            Orden orden = ordenOpt.get();
            orden.setEstadoOrden(EstadoOrden.enviada_cocina);
            List<OrdenPlatillo> platillos = ordenPlatilloRepository.findByOrdenOrdenId(ordenId);
            for (OrdenPlatillo platillo : platillos) {
                platillo.setEstadoPreparacion(EstadoPreparacion.pendiente);
                platillo.setHoraEnvioCocina(LocalDateTime.now());
                ordenPlatilloRepository.save(platillo);
            }
            
            ordenRepository.save(orden);
            return true;
        }
        return false;
    }

    @Transactional
    public boolean actualizarEstadoOrden(Integer ordenId, EstadoOrden nuevoEstado) {
        Optional<Orden> ordenOpt = ordenRepository.findById(ordenId);
        if (ordenOpt.isPresent()) {
            Orden orden = ordenOpt.get();
            orden.setEstadoOrden(nuevoEstado);
            ordenRepository.save(orden);
            return true;
        }
        return false;
    }


    @Transactional // Asegúrate de que sea transaccional
    public boolean agregarPlatillo(Integer ordenId, AgregarPlatilloDTO dto) {
        Optional<Orden> ordenOpt = ordenRepository.findById(ordenId);
        Optional<Platillo> platilloOpt = platilloRepository.findById(dto.getPlatilloId());
            
        if (!ordenOpt.isPresent() || !platilloOpt.isPresent()) {
            return false;
        }
        Orden orden = ordenOpt.get();
        Platillo platillo = platilloOpt.get();
            
        if (orden.getEstadoOrden() != EstadoOrden.abierta) {
            return false;
        }
        // Asumiendo que Platillo tiene el getter getDisponible()
        // if (!platillo.getDisponible()) {
        //     return false;
        // }
        
        OrdenPlatillo ordenPlatillo = new OrdenPlatillo();
        ordenPlatillo.setOrden(orden);
        ordenPlatillo.setPlatillo(platillo);
        ordenPlatillo.setCantidad(dto.getCantidad());
        ordenPlatillo.setPrecioUnitario(platillo.getPrecioPlatillo());
            
        BigDecimal subtotal = platillo.getPrecioPlatillo()
            .multiply(BigDecimal.valueOf(dto.getCantidad()));
        ordenPlatillo.setSubtotal(subtotal);
        ordenPlatillo.setNotasPlatillo(dto.getNotasPlatillo());
        ordenPlatillo.setEstadoPreparacion(EstadoPreparacion.pendiente);
            
        ordenPlatilloRepository.save(ordenPlatillo);
        recalcularTotales(orden);
        return true;
    }

    private void recalcularTotales(Orden orden) {
        List<OrdenPlatillo> platillos = ordenPlatilloRepository.findByOrden_OrdenId(orden.getOrdenId());
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrdenPlatillo op : platillos) {
            subtotal = subtotal.add(op.getSubtotal());
        }
        BigDecimal impuestos = subtotal.multiply(BigDecimal.valueOf(0.12));
        BigDecimal total = subtotal.add(impuestos).subtract(orden.getDescuento());
            
        orden.setSubtotal(subtotal);
        orden.setImpuestos(impuestos);
        orden.setTotalOrden(total);
        ordenRepository.save(orden);
    }
    
    // --- MÉTODOS CORREGIDOS Y AGREGADOS PARA EL ESTADO DEL PLATILLO ---

    @Transactional
    public boolean actualizarEstadoPlatilloOrden(Integer ordenPlatilloId, EstadoPreparacion nuevoEstado, Integer cocineroId) {
        Optional<OrdenPlatillo> opOpt = ordenPlatilloRepository.findById(ordenPlatilloId);
        if (!opOpt.isPresent()) {
            return false;
        }

        OrdenPlatillo ordenPlatillo = opOpt.get();
        
        if (cocineroId != null) {
            Optional<Usuario> cocineroOpt = usuarioRepository.findById(cocineroId);
            if (cocineroOpt.isPresent()) {
                ordenPlatillo.setCocineroAsignado(cocineroOpt.get());
            }
        }

        // Correcciones aplicadas aquí (sustituyendo 'en_proceso' por 'en_cocina' y 'lista' por 'listo')
        if (nuevoEstado == EstadoPreparacion.en_cocina) {
            ordenPlatillo.setHoraInicioPreparacion(LocalDateTime.now());
        } else if (nuevoEstado == EstadoPreparacion.listo) {
            ordenPlatillo.setHoraFinPreparacion(LocalDateTime.now());
        }

        ordenPlatillo.setEstadoPreparacion(nuevoEstado);
        ordenPlatilloRepository.save(ordenPlatillo);
        
        actualizarEstadoGeneralOrden(ordenPlatillo.getOrden().getOrdenId());
        
        return true;
    }
    
    private void actualizarEstadoGeneralOrden(Integer ordenId) {
        Optional<Orden> ordenOpt = ordenRepository.findById(ordenId);
        if (ordenOpt.isPresent()) {
            Orden orden = ordenOpt.get();
            List<OrdenPlatillo> platillos = ordenPlatilloRepository.findByOrden_OrdenId(ordenId);
            
            boolean todosListosOServidos = platillos.stream()
                .allMatch(op -> op.getEstadoPreparacion() == EstadoPreparacion.listo || 
                                 op.getEstadoPreparacion() == EstadoPreparacion.servido ||
                                 op.getEstadoPreparacion() == EstadoPreparacion.cancelado);

            if (todosListosOServidos && orden.getEstadoOrden() == EstadoOrden.enviada_cocina) {
                orden.setEstadoOrden(EstadoOrden.lista_para_servir);
                ordenRepository.save(orden);
            }
        }
    }
}