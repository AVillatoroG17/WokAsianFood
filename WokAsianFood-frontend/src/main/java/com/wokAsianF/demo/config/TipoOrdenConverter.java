package com.wokAsianF.demo.config;

import com.wokAsianF.demo.enums.TipoOrden;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TipoOrdenConverter implements AttributeConverter<TipoOrden, String> {

    @Override
    public String convertToDatabaseColumn(TipoOrden tipoOrden) {
        if (tipoOrden == null) {
            return null;
        }
        return tipoOrden.name().toLowerCase(); 
    }

    @Override
    public TipoOrden convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return TipoOrden.valueOf(dbData.toUpperCase()); 
    }
}