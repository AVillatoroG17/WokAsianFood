package com.wokAsianF.demo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.wokAsianF.demo.enums.EstadoPreparacion;
import com.wokAsianF.demo.enums.Prioridad;

@Entity
@Table(name = "orden_platillo")
public class OrdenPlatillo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "orden_platillo_id")
    private Integer ordenPlatilloId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_id", nullable = false)
    private Orden orden;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "platillo_id", nullable = false)
    private Platillo platillo;
    
    @Column(nullable = false, columnDefinition = "integer default 1")
    private Integer cantidad = 1;
    
    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_preparacion", columnDefinition = "varchar default 'pendiente'")
    private EstadoPreparacion estadoPreparacion = EstadoPreparacion.pendiente;
    
    @Column(name = "hora_envio_cocina")
    private LocalDateTime horaEnvioCocina;
    
    @Column(name = "hora_inicio_preparacion")
    private LocalDateTime horaInicioPreparacion;
    
    @Column(name = "hora_fin_preparacion")
    private LocalDateTime horaFinPreparacion;
    
    @Column(name = "hora_servido")
    private LocalDateTime horaServido;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cocinero_asignado")
    private Usuario cocineroAsignado;
    
    @Column(name = "notas_platillo", columnDefinition = "TEXT")
    private String notasPlatillo;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "prioridad", columnDefinition = "varchar default 'normal'")
    private Prioridad prioridad = Prioridad.normal;

    public OrdenPlatillo() {}

    public Integer getOrdenPlatilloId() { return ordenPlatilloId; }
    public void setOrdenPlatilloId(Integer ordenPlatilloId) { this.ordenPlatilloId = ordenPlatilloId; }
    public Orden getOrden() { return orden; }
    public void setOrden(Orden orden) { this.orden = orden; }
    public Platillo getPlatillo() { return platillo; }
    public void setPlatillo(Platillo platillo) { this.platillo = platillo; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public EstadoPreparacion getEstadoPreparacion() { return estadoPreparacion; }
    public void setEstadoPreparacion(EstadoPreparacion estadoPreparacion) { this.estadoPreparacion = estadoPreparacion; }
    public LocalDateTime getHoraEnvioCocina() { return horaEnvioCocina; }
    public void setHoraEnvioCocina(LocalDateTime horaEnvioCocina) { this.horaEnvioCocina = horaEnvioCocina; }
    public LocalDateTime getHoraInicioPreparacion() { return horaInicioPreparacion; }
    public void setHoraInicioPreparacion(LocalDateTime horaInicioPreparacion) { this.horaInicioPreparacion = horaInicioPreparacion; }
    public LocalDateTime getHoraFinPreparacion() { return horaFinPreparacion; }
    public void setHoraFinPreparacion(LocalDateTime horaFinPreparacion) { this.horaFinPreparacion = horaFinPreparacion; }
    public LocalDateTime getHoraServido() { return horaServido; }
    public void setHoraServido(LocalDateTime horaServido) { this.horaServido = horaServido; }
    public Usuario getCocineroAsignado() { return cocineroAsignado; }
    public void setCocineroAsignado(Usuario cocineroAsignado) { this.cocineroAsignado = cocineroAsignado; }
    public String getNotasPlatillo() { return notasPlatillo; }
    public void setNotasPlatillo(String notasPlatillo) { this.notasPlatillo = notasPlatillo; }
    public Prioridad getPrioridad() { return prioridad; }
    public void setPrioridad(Prioridad prioridad) { this.prioridad = prioridad; }
}
