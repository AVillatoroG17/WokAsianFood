package com.wokAsianF.demo.DTOs;

public class RegistroResponseDTO {
    private Boolean exito;
    private String mensaje;
    private Integer usuarioId;
    
    public RegistroResponseDTO() {}

    public Boolean getExito() { return exito; }
    public void setExito(Boolean exito) { this.exito = exito; }
    
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    
    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }
}