package com.wokAsianF.demo.enums;

public enum EstadoOrden {
	// Estados iniciales y de pago
	ABIERTA,
	PAGADA,
	CANCELADA,
	LISTA,
	ENTREGADA,
	LISTA_PARA_PAGO,

	// Estados de preparación y servicio
	ENVIADA_COCINA,     // Sent to kitchen (anteriormente: enviada_cocina)
	EN_PROCESO,         // In process (Preparation) (anteriormente: en_proceso)
	LISTA_PARA_SERVIR,  // Ready to serve (anteriormente: lista_para_servir)
	SERVIDA             // Served (anteriormente: servida)
}
