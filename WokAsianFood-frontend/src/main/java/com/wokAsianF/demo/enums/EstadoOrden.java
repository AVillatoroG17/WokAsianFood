package com.wokAsianF.demo.enums;


public enum EstadoOrden {
    // Estados iniciales y de pago
    abierta,        // Open
    pagada,         // Paid
    cancelada,      // Canceled
    lista,
    entregada,
    lista_para_pago,

    // Estados de preparación y servicio
    enviada_cocina, // Sent to kitchen
    en_proceso,     // In process (Preparation)
    lista_para_servir, // Ready to serve
    servida         // Served
}
