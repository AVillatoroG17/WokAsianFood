-- V2__insert_sample_data.sql

-- Insertar Categorías de Platillos
INSERT INTO public.categoria_platillo (nombre_categoria, orden_preparacion, color_identificacion, activa) VALUES
('Entradas', 1, '#FFC107', TRUE),
('Platos Fuertes', 2, '#4CAF50', TRUE),
('Bebidas', 3, '#2196F3', TRUE);

-- Insertar Mesas
INSERT INTO public.mesa (numero_mesa, capacidad, ubicacion, activa) VALUES
('1', 4, 'interior'::ubicacion_mesa, TRUE),
('2', 2, 'terraza'::ubicacion_mesa, TRUE),
('3', 6, 'interior'::ubicacion_mesa, TRUE),
('4', 4, 'barra'::ubicacion_mesa, TRUE);

-- Insertar Usuarios (Mesero y Admin)
INSERT INTO public.usuario (nombre_usuario, nombre_completo, email, password_hash, rol, activo, fecha_creacion)
VALUES
('mesero1', 'Juan Pérez', 'juan.perez@example.com', 'password', 'mesero', TRUE, CURRENT_TIMESTAMP),
('admin1', 'Admin General', 'admin@example.com', 'adminpass', TRUE, CURRENT_TIMESTAMP);

-- Insertar Platillos (asumiendo que los IDs de categoría son 1, 2, 3 respectivamente)
INSERT INTO public.platillo (nombre_platillo, categoria_id, precio_platillo, tiempo_preparacion, disponible, descripcion, imagen_url, ingredientes_descripcion) VALUES
('Rollitos Primavera', (SELECT categoria_id FROM public.categoria_platillo WHERE nombre_categoria = 'Entradas'), 35.00, 10, TRUE, 'Deliciosos rollitos rellenos de vegetales.', NULL, NULL),
('Arroz Frito con Pollo', (SELECT categoria_id FROM public.categoria_platillo WHERE nombre_categoria = 'Platos Fuertes'), 60.00, 20, TRUE, 'Arroz salteado con pollo y vegetales.', NULL, NULL),
('Chow Mein de Res', (SELECT categoria_id FROM public.categoria_platillo WHERE nombre_categoria = 'Platos Fuertes'), 65.00, 25, TRUE, 'Fideos salteados con carne de res y vegetales.', NULL, NULL),
('Gaseosa Coca-Cola', (SELECT categoria_id FROM public.categoria_platillo WHERE nombre_categoria = 'Bebidas'), 15.00, 2, TRUE, 'Lata de Coca-Cola.', NULL, NULL);
