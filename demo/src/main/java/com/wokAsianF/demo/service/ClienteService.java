package com.wokAsianF.demo.service;

import com.wokAsianF.demo.entity.Cliente;
import com.wokAsianF.demo.repository.ClienteRepository;
import com.wokAsianF.demo.DTOs.ClienteDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClienteService {
    @Autowired
    private ClienteRepository clienteRepository;

    public List<ClienteDTO> obtenerTodos(String telefono) {
        List<Cliente> clientes;
        if (telefono != null && !telefono.isEmpty()) {
            clientes = clienteRepository.findByTelefonoContaining(telefono);
        } else {
            clientes = clienteRepository.findAll();
        }
        return clientes.stream()
                .map(this::convertirAClienteDTO)
                .collect(Collectors.toList());
    }

    public Optional<ClienteDTO> obtenerPorId(Integer id) {
        return clienteRepository.findById(id)
                .map(this::convertirAClienteDTO);
    }

    private ClienteDTO convertirAClienteDTO(Cliente cliente) {
        ClienteDTO dto = new ClienteDTO();
        dto.setClienteId(cliente.getClienteId());
        dto.setNombre(cliente.getNombre());
        dto.setTelefono(cliente.getTelefono());
        dto.setEmail(cliente.getEmail());
        dto.setFechaRegistro(cliente.getFechaRegistro());
        dto.setTotalOrdenes(cliente.getTotalOrdenes());
        dto.setClienteFrecuente(cliente.getClienteFrecuente());
        return dto;
    }

    public Cliente crear(Cliente cliente) {
        cliente.setFechaRegistro(LocalDateTime.now());
        return clienteRepository.save(cliente);
    }

    public Cliente actualizar(Integer id, Cliente clienteActualizado) {
        return clienteRepository.findById(id)
            .map(cliente -> {
                cliente.setNombre(clienteActualizado.getNombre());
                cliente.setTelefono(clienteActualizado.getTelefono());
                cliente.setEmail(clienteActualizado.getEmail());
                cliente.setTotalOrdenes(clienteActualizado.getTotalOrdenes());
                cliente.setClienteFrecuente(clienteActualizado.getClienteFrecuente());
                return clienteRepository.save(cliente);
            }).orElse(null);
    }

    public boolean eliminar(Integer id) {
        if (clienteRepository.existsById(id)) {
            clienteRepository.deleteById(id);
            return true;
        }
        return false;
    }
}