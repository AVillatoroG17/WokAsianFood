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

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList; 
import java.util.Collections;
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
    @Autowired 
    private MesaRepository mesaRepository;
    @Autowired 
    private ClienteRepository clienteRepository;

    public List<OrdenDTO> obtenerTodos(List<EstadoOrden> estados, Integer mesaId) {
        // CORRECCIÓN PREVIA: Inicializar 'ordenes' con una lista vacía para evitar el error.
        List<Orden> ordenes = new ArrayList<>(); 
        
        if (mesaId != null) {
            Orden ordenActivaEnMesa = ordenRepository.findByMesaMesaId(mesaId);
            if (ordenActivaEnMesa != null) {
                ordenes = Collections.singletonList(ordenActivaEnMesa);
            } 
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

    public OrdenDTO convertirAOrdenDTO(Orden orden) {
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
        dto.setNombreCocinero(
                ordenPlatillo.getCocineroAsignado() != null ? ordenPlatillo.getCocineroAsignado().getNombreCompleto()
                        : null);
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

        nuevaOrden.setFechaOrden(Instant.now());
        nuevaOrden.setTipoOrden(ordenInputDTO.getTipoOrden());
        nuevaOrden.setEstadoOrden(EstadoOrden.ABIERTA);
        nuevaOrden.setNotasGenerales(ordenInputDTO.getNotasGenerales());
        nuevaOrden.setNumeroPersonas(ordenInputDTO.getNumeroPersonas() != null ? ordenInputDTO.getNumeroPersonas() : 1);
        nuevaOrden.setDireccionEntrega(ordenInputDTO.getDireccionEntrega());
        nuevaOrden.setTelefonoContacto(ordenInputDTO.getTelefonoContacto());
        nuevaOrden.setDescuento(BigDecimal.ZERO);

        // 1. Asignar Mesero (requerido)
        Usuario mesero = usuarioRepository.findById(ordenInputDTO.getMeseroId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Mesero no encontrado con ID: " + ordenInputDTO.getMeseroId()));
        nuevaOrden.setMesero(mesero);

        // 2. Asignar Mesa (opcional, asumiendo mesa_id es opcional)
        if (ordenInputDTO.getMesaId() != null) {
            Mesa mesa = mesaRepository.findById(ordenInputDTO.getMesaId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Mesa no encontrada con ID: " + ordenInputDTO.getMesaId()));
            nuevaOrden.setMesa(mesa);
        }

        // 3. Asignar Cliente (opcional, asumiendo cliente_id es opcional)
        if (ordenInputDTO.getClienteId() != null) {
            Cliente cliente = clienteRepository.findById(ordenInputDTO.getClienteId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Cliente no encontrado con ID: " + ordenInputDTO.getClienteId()));
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
        }
        recalcularTotales(savedOrden);

        // 5. Convertir la entidad guardada al DTO y devolver.
        return convertirAOrdenDTO(savedOrden);
    }

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
            orden.setEstadoOrden(EstadoOrden.ENVIADA_COCINA);
            // El estado inicial del platillo individual es PENDIENTE
            List<OrdenPlatillo> platillos = ordenPlatilloRepository.findByOrdenOrdenId(ordenId);
            for (OrdenPlatillo platillo : platillos) {
                platillo.setEstadoPreparacion(EstadoPreparacion.PENDIENTE);
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

    @Transactional
    public boolean agregarPlatillo(Integer ordenId, AgregarPlatilloDTO dto) {
        Optional<Orden> ordenOpt = ordenRepository.findById(ordenId);
        Optional<Platillo> platilloOpt = platilloRepository.findById(dto.getPlatilloId());

        if (!ordenOpt.isPresent() || !platilloOpt.isPresent()) {
            return false;
        }
        Orden orden = ordenOpt.get();
        Platillo platillo = platilloOpt.get();

        if (orden.getEstadoOrden() != EstadoOrden.ABIERTA) {
            return false;
        }

        OrdenPlatillo ordenPlatillo = new OrdenPlatillo();
        ordenPlatillo.setOrden(orden);
        ordenPlatillo.setPlatillo(platillo);
        ordenPlatillo.setCantidad(dto.getCantidad());
        ordenPlatillo.setPrecioUnitario(platillo.getPrecioPlatillo());

        BigDecimal subtotal = platillo.getPrecioPlatillo()
                .multiply(BigDecimal.valueOf(dto.getCantidad()));
        ordenPlatillo.setSubtotal(subtotal);
        ordenPlatillo.setNotasPlatillo(dto.getNotasPlatillo());
        ordenPlatillo.setEstadoPreparacion(EstadoPreparacion.PENDIENTE);

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

    // --- MÉTODOS DE FLUJO DE COCINA ---

    @Transactional
    public boolean actualizarEstadoPlatilloOrden(Integer ordenPlatilloId, EstadoPreparacion nuevoEstado,
                Integer cocineroId) {
        Optional<OrdenPlatillo> opOpt = ordenPlatilloRepository.findById(ordenPlatilloId);
        if (!opOpt.isPresent()) {
            return false;
        }

        OrdenPlatillo ordenPlatillo = opOpt.get();

        // 1. Asignar Cocinero
        if (cocineroId != null) {
            Optional<Usuario> cocineroOpt = usuarioRepository.findById(cocineroId);
            if (cocineroOpt.isPresent()) {
                ordenPlatillo.setCocineroAsignado(cocineroOpt.get());
            }
        }

        // 2. Establecer timestamps
        // Usamos EN_COCINA porque ese es el valor en el Enum de Java (corregido de EN_PREPARACION en FE)
        if (nuevoEstado == EstadoPreparacion.EN_COCINA) {
            ordenPlatillo.setHoraInicioPreparacion(LocalDateTime.now());
        } else if (nuevoEstado == EstadoPreparacion.LISTO) {
            ordenPlatillo.setHoraFinPreparacion(LocalDateTime.now());
        }

        ordenPlatillo.setEstadoPreparacion(nuevoEstado);
        ordenPlatilloRepository.save(ordenPlatillo);

        // 3. Actualizar estado general de la orden
        actualizarEstadoGeneralOrden(ordenPlatillo.getOrden().getOrdenId());

        return true;
    }

    private void actualizarEstadoGeneralOrden(Integer ordenId) {
        Optional<Orden> ordenOpt = ordenRepository.findById(ordenId);
        if (ordenOpt.isPresent()) {
            Orden orden = ordenOpt.get();
            List<OrdenPlatillo> platillos = ordenPlatilloRepository.findByOrden_OrdenId(ordenId);

            // La orden está lista si TODOS los platillos están LISTO, SERVIDO o CANCELADO
            boolean todosListosOServidos = platillos.stream()
                    .allMatch(op -> op.getEstadoPreparacion() == EstadoPreparacion.LISTO ||
                                    op.getEstadoPreparacion() == EstadoPreparacion.SERVIDO ||
                                    op.getEstadoPreparacion() == EstadoPreparacion.CANCELADO);

            // Solo actualizamos a LISTA_PARA_SERVIR si previamente fue enviada a cocina
            if (todosListosOServidos && orden.getEstadoOrden() == EstadoOrden.ENVIADA_COCINA) {
                orden.setEstadoOrden(EstadoOrden.LISTA_PARA_SERVIR);
                ordenRepository.save(orden);
            }
        }
    }
    
    // --- NUEVO MÉTODO PARA EL MESERO (MARCAR SERVIDA) ---
    /**
     * Marca todos los platillos de una orden de LISTO a SERVIDO y el estado de la orden a SERVIDA.
     * @param ordenId ID de la orden.
     * @param meseroId ID del mesero que realiza la acción (puede ser null si no se necesita registrar).
     * @return true si la operación fue exitosa.
     */
    @Transactional
    public boolean marcarOrdenComoServida(Integer ordenId, Integer meseroId) {
        Optional<Orden> ordenOpt = ordenRepository.findById(ordenId);
        if (!ordenOpt.isPresent()) {
            return false;
        }

        Orden orden = ordenOpt.get();

        // Verificar el estado correcto de la orden
        if (orden.getEstadoOrden() != EstadoOrden.LISTA_PARA_SERVIR) {
            // Se puede lanzar una excepción aquí si se prefiere un manejo de error más formal.
            return false;
        }
        
        // 1. Marcar todos los platillos LISTO como SERVIDO 
        List<OrdenPlatillo> platillos = ordenPlatilloRepository.findByOrden_OrdenId(ordenId);
        for (OrdenPlatillo op : platillos) {
            // Solo actualiza si está LISTO. Los CANCELADO/SERVIDO se quedan igual.
            if (op.getEstadoPreparacion() == EstadoPreparacion.LISTO) {
                op.setEstadoPreparacion(EstadoPreparacion.SERVIDO);
                // Si necesitas registrar el mesero, hazlo aquí.
                ordenPlatilloRepository.save(op);
            }
        }

        // 2. Actualizar el estado general de la Orden
        orden.setEstadoOrden(EstadoOrden.SERVIDA);
        ordenRepository.save(orden);

        return true;
    }
    
    // --- FIN DE MÉTODOS DE FLUJO ---

    public Integer obtenerMeseroIdPorNombre(String nombreCompleto) {
        return usuarioRepository.findByNombreCompleto(nombreCompleto)
                .map(Usuario::getUsuarioId)
                .orElse(null);
    }
}