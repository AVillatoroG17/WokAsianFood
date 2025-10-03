package com.wokAsianF.demo.service;


import com.wokAsianF.demo.entity.OrdenPlatillo;
import com.wokAsianF.demo.entity.Usuario;
import com.wokAsianF.demo.repository.OrdenPlatilloRepository;
import com.wokAsianF.demo.repository.UsuarioRepository;
import com.wokAsianF.demo.DTOs.PlatilloCocinaDTO;
import com.wokAsianF.demo.enums.EstadoPreparacion;
import com.wokAsianF.demo.enums.RolUsuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
@Service
public class CocinaService {
@Autowired
private OrdenPlatilloRepository ordenPlatilloRepository;
@Autowired
private UsuarioRepository usuarioRepository;
public List<PlatilloCocinaDTO> obtenerPlatillosPendientes() {
List<OrdenPlatillo> platillos = ordenPlatilloRepository.findByEstadoPreparacion(EstadoPreparacion.pendiente);
return platillos.stream()
.map(this::convertirAPlatilloCocinaDTO)
.collect(Collectors.toList());
}
public List<PlatilloCocinaDTO> obtenerMisPlatillos(Integer cocineroId) {
List<OrdenPlatillo> platillos = ordenPlatilloRepository.findByCocineroAsignado_UsuarioIdAndEstadoPreparacion(
cocineroId, EstadoPreparacion.en_cocina);
return platillos.stream()
.map(this::convertirAPlatilloCocinaDTO)
.collect(Collectors.toList());
}
private PlatilloCocinaDTO convertirAPlatilloCocinaDTO(OrdenPlatillo ordenPlatillo) {
PlatilloCocinaDTO dto = new PlatilloCocinaDTO();
dto.setOrdenPlatilloId(ordenPlatillo.getOrdenPlatilloId());
dto.setNumeroOrden(ordenPlatillo.getOrden().getNumeroOrden());
dto.setNumeroMesa(ordenPlatillo.getOrden().getMesa() != null ?
ordenPlatillo.getOrden().getMesa().getNumeroMesa() : "N/A");
dto.setNombrePlatillo(ordenPlatillo.getPlatillo().getNombrePlatillo());
dto.setCantidad(ordenPlatillo.getCantidad());
dto.setEstadoPreparacion(ordenPlatillo.getEstadoPreparacion());
dto.setPrioridad(ordenPlatillo.getPrioridad());
dto.setNotasPlatillo(ordenPlatillo.getNotasPlatillo());
dto.setHoraEnvioCocina(ordenPlatillo.getHoraEnvioCocina());
dto.setNombreCocineroAsignado(ordenPlatillo.getCocineroAsignado() != null ?
ordenPlatillo.getCocineroAsignado().getNombreCompleto() : null);
return dto;
}
public boolean iniciarPreparacion(Integer ordenPlatilloId, Integer cocineroId) {
Optional<OrdenPlatillo> platilloOpt = ordenPlatilloRepository.findById(ordenPlatilloId);
Optional<Usuario> cocineroOpt = usuarioRepository.findById(cocineroId);

if (!platilloOpt.isPresent() || !cocineroOpt.isPresent()) {
return false;
}
OrdenPlatillo platillo = platilloOpt.get();
Usuario cocinero = cocineroOpt.get();

if (cocinero.getRol() != RolUsuario.cocinero) {
return false;
}
if (platillo.getEstadoPreparacion() != EstadoPreparacion.pendiente) {
return false;
}
platillo.setEstadoPreparacion(EstadoPreparacion.en_cocina);
platillo.setCocineroAsignado(cocinero);
platillo.setHoraInicioPreparacion(LocalDateTime.now());
ordenPlatilloRepository.save(platillo);
return true;
}
public boolean marcarListo(Integer ordenPlatilloId) {
Optional<OrdenPlatillo> platilloOpt = ordenPlatilloRepository.findById(ordenPlatilloId);
if (!platilloOpt.isPresent()) {
return false;
}
OrdenPlatillo platillo = platilloOpt.get();
if (platillo.getEstadoPreparacion() != EstadoPreparacion.en_cocina) {
return false;
}
platillo.setEstadoPreparacion(EstadoPreparacion.listo);
platillo.setHoraFinPreparacion(LocalDateTime.now());
ordenPlatilloRepository.save(platillo);
return true;
}
}
