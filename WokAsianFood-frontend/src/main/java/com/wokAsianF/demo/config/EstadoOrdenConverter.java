package com.wokAsianF.demo.config;

import com.wokAsianF.demo.enums.EstadoOrden;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class EstadoOrdenConverter implements AttributeConverter<EstadoOrden, String> {

    @Override
    public String convertToDatabaseColumn(EstadoOrden estadoOrden) {
        if (estadoOrden == null) {
            return null;
        }
        return estadoOrden.name();
    }

    @Override
    public EstadoOrden convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return EstadoOrden.valueOf(dbData);
    }
}