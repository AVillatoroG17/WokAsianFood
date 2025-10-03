package com.wokAsianF.demo.DTOs;

import com.wokAsianF.demo.enums.RolUsuario; 

public class RegistroDTO {
    private String nombreUsuario;
    private String nombreCompleto;
    private String email;
    private String password;
    private RolUsuario rol;
    
    public RegistroDTO() {}

    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }
    
    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public RolUsuario getRol() { return rol; }
    public void setRol(RolUsuario rol) { this.rol = rol; }
}