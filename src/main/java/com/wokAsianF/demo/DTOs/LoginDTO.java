package com.wokAsianF.demo.DTOs;

public class LoginDTO {
private String nombreUsuario;
private String password;
public LoginDTO() {}
public String getNombreUsuario() { return nombreUsuario; }
public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }
public String getPassword() { return password; }
public void setPassword(String password) { this.password = password; }
}