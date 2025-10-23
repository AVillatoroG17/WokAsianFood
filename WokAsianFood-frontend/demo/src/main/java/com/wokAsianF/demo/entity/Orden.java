package com.wokAsianF.demo.entity;


import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.wokAsianF.demo.enums.EstadoOrden;
import com.wokAsianF.demo.enums.TipoOrden;

@Entity
@Table(name = "orden")
public class Orden {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "orden_id")
    private Integer ordenId;
    
    @Column(name = "numero_orden", nullable = false, unique = true, length = 20)
    private String numeroOrden;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mesa_id")
    private Mesa mesa;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mesero_id", nullable = false)
    private Usuario mesero;
    
    @Column(name = "fecha_orden")
    private LocalDateTime fechaOrden;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_orden", columnDefinition = "varchar default 'mesa'")
    private TipoOrden tipoOrden = TipoOrden.mesa;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_orden", columnDefinition = "varchar default 'abierta'")
    private EstadoOrden estadoOrden = EstadoOrden.abierta;
    
    @Column(precision = 10, scale = 2, columnDefinition = "decimal default 0")
    private BigDecimal subtotal = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2, columnDefinition = "decimal default 0")
    private BigDecimal impuestos = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2, columnDefinition = "decimal default 0")
    private BigDecimal descuento = BigDecimal.ZERO;
    
    @Column(name = "total_orden", precision = 10, scale = 2, columnDefinition = "decimal default 0")
    private BigDecimal totalOrden = BigDecimal.ZERO;
    
    @Column(name = "notas_generales", columnDefinition = "TEXT")
    private String notasGenerales;
    
    @Column(name = "direccion_entrega", columnDefinition = "TEXT")
    private String direccionEntrega;
    
    @Column(name = "telefono_contacto", length = 15)
    private String telefonoContacto;
    
    @Column(name = "numero_personas", columnDefinition = "integer default 1")
    private Integer numeroPersonas = 1;
    
    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrdenPlatillo> platillos;

    public Orden() {}

    public Integer getOrdenId() { return ordenId; }
    public void setOrdenId(Integer ordenId) { this.ordenId = ordenId; }
    public String getNumeroOrden() { return numeroOrden; }
    public void setNumeroOrden(String numeroOrden) { this.numeroOrden = numeroOrden; }
    public Mesa getMesa() { return mesa; }
    public void setMesa(Mesa mesa) { this.mesa = mesa; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public Usuario getMesero() { return mesero; }
    public void setMesero(Usuario mesero) { this.mesero = mesero; }
    public LocalDateTime getFechaOrden() { return fechaOrden; }
    public void setFechaOrden(LocalDateTime fechaOrden) { this.fechaOrden = fechaOrden; }
    public TipoOrden getTipoOrden() { return tipoOrden; }
    public void setTipoOrden(TipoOrden tipoOrden) { this.tipoOrden = tipoOrden; }
    public EstadoOrden getEstadoOrden() { return estadoOrden; }
    public void setEstadoOrden(EstadoOrden estadoOrden) { this.estadoOrden = estadoOrden; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getImpuestos() { return impuestos; }
    public void setImpuestos(BigDecimal impuestos) { this.impuestos = impuestos; }
    public BigDecimal getDescuento() { return descuento; }
    public void setDescuento(BigDecimal descuento) { this.descuento = descuento; }
    public BigDecimal getTotalOrden() { return totalOrden; }
    public void setTotalOrden(BigDecimal totalOrden) { this.totalOrden = totalOrden; }
    public String getNotasGenerales() { return notasGenerales; }
    public void setNotasGenerales(String notasGenerales) { this.notasGenerales = notasGenerales; }
    public String getDireccionEntrega() { return direccionEntrega; }
    public void setDireccionEntrega(String direccionEntrega) { this.direccionEntrega = direccionEntrega; }
    public String getTelefonoContacto() { return telefonoContacto; }
    public void setTelefonoContacto(String telefonoContacto) { this.telefonoContacto = telefonoContacto; }
    public Integer getNumeroPersonas() { return numeroPersonas; }
    public void setNumeroPersonas(Integer numeroPersonas) { this.numeroPersonas = numeroPersonas; }
    public List<OrdenPlatillo> getPlatillos() { return platillos; }
    public void setPlatillos(List<OrdenPlatillo> platillos) { this.platillos = platillos; }
}