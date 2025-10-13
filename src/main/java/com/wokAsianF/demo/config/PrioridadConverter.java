package com.wokAsianF.demo.config;

import com.wokAsianF.demo.enums.Prioridad;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.stream.Stream;

@Converter(autoApply = true)
public class PrioridadConverter implements AttributeConverter<Prioridad, String> {

    @Override
    public String convertToDatabaseColumn(Prioridad prioridad) {
        if (prioridad == null) {
            return null;
        }
        return prioridad.name();
    }

    @Override
    public Prioridad convertToEntityAttribute(String code) {
        if (code == null) {
            return null;
        }
        return Stream.of(Prioridad.values())
          .filter(c -> c.name().equals(code))
          .findFirst()
          .orElseThrow(IllegalArgumentException::new);
    }
}
