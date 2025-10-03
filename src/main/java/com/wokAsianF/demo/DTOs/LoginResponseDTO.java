package com.wokAsianF.demo.DTOs;

import com.wokAsianF.demo.enums.RolUsuario;

public class LoginResponseDTO {
private Integer usuarioId;
private String nombreUsuario;
private String nombreCompleto;
private RolUsuario rol;
private String mensaje;
private Boolean exito;
public LoginResponseDTO() {}
public Integer getUsuarioId() { return usuarioId; }
public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }
public String getNombreUsuario() { return nombreUsuario; }
public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }
public String getNombreCompleto() { return nombreCompleto; }
public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }
public RolUsuario getRol() { return rol; }
public void setRol(RolUsuario rol) { this.rol = rol; }
public String getMensaje() { return mensaje; }
public void setMensaje(String mensaje) { this.mensaje = mensaje; }
public Boolean getExito() { return exito; }
public void setExito(Boolean exito) { this.exito = exito; }
}