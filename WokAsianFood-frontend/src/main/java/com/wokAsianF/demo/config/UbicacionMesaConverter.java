package com.wokAsianF.demo.config;

import com.wokAsianF.demo.enums.UbicacionMesa;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class UbicacionMesaConverter implements AttributeConverter<UbicacionMesa, String> {

    @Override
    public String convertToDatabaseColumn(UbicacionMesa attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public UbicacionMesa convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return UbicacionMesa.valueOf(dbData);
    }
}