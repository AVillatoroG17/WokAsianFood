package com.wokAsianF.demo.DTOs;

public class AgregarPlatilloDTO {
private Integer platilloId;
private Integer cantidad;
private String notasPlatillo;
public AgregarPlatilloDTO() {}
public Integer getPlatilloId() { return platilloId; }
public void setPlatilloId(Integer platilloId) { this.platilloId = platilloId; }
public Integer getCantidad() { return cantidad; }
public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
public String getNotasPlatillo() { return notasPlatillo; }
public void setNotasPlatillo(String notasPlatillo) { this.notasPlatillo = notasPlatillo; }
}