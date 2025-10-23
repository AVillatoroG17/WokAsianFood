package com.wokAsianF.demo.config;

import com.wokAsianF.demo.enums.EstadoPreparacion;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class EstadoPreparacionConverter implements AttributeConverter<EstadoPreparacion, String> {

    @Override
    public String convertToDatabaseColumn(EstadoPreparacion estadoPreparacion) {
        if (estadoPreparacion == null) {
            return null;
        }
        return estadoPreparacion.name();
    }

    @Override
    public EstadoPreparacion convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return EstadoPreparacion.valueOf(dbData);
    }
}
