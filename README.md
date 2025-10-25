Wok Asian Food - Sistema de Gestión de Restaurante

Sistema completo de gestión para restaurantes de comida asiática, desarrollado con Spring Boot (Backend) y React + TypeScript (Frontend).

Tabla de Contenidos

Características

Tecnologías Utilizadas

Requisitos Previos

Instalación

Configuración

Ejecución

Usuarios de Prueba

Estructura del Proyecto

API Endpoints

Licencia

Autores

Capturas de Pantalla

Características
Gestión por Roles

Admin: Control total del sistema, estadísticas, gestión de usuarios y mesas.

Mesero: Toma de órdenes, gestión de clientes, marcar órdenes como servidas.

Cocinero: Visualización de pedidos, control de preparación, gestión de platillos.

Cajero: Facturación, procesamiento de pagos, cierre de órdenes.

Encargado: Gestión de inventario y suministros.

Funcionalidades Principales

Autenticación JWT con Spring Security

Dashboard de estadísticas en tiempo real

Sistema de órdenes con flujo completo (Mesero → Cocina → Servicio → Caja)

Vista Kanban para cocina (Pendientes / En Preparación / Listos)

Múltiples métodos de pago (Efectivo, Tarjeta, Mixto)

Control de inventario y suministros

Gestión de mesas con ubicación y estado

Registro y búsqueda de clientes

Tecnologías Utilizadas
Backend

Java 17

Spring Boot 3.5.6

Spring Security + JWT

PostgreSQL 16+

JPA / Hibernate

Maven

Frontend

React 18.2

TypeScript 5.2

Vite 5.1

Tailwind CSS 3.4

Axios

React Router DOM 6

Lucide React (Iconos)

Requisitos Previos

Asegúrate de tener instalado lo siguiente:

# Java
java -version
# Node.js y npm
node -v
npm -v
# PostgreSQL
psql --version
# Git
git --version


Recomendado: Visual Studio Code
Extensiones sugeridas:

Extension Pack for Java

Spring Boot Extension Pack

ES7+ React/Redux/React-Native snippets

Tailwind CSS IntelliSense

Instalación
<details> <summary><strong>1. Backend (Spring Boot)</strong></summary>
1.1 Clonar el Repositorio
git clone https://github.com/tu-usuario/WokAsianFood-backend.git
cd WokAsianFood-backend

1.2 Crear la Base de Datos
CREATE DATABASE Prueba_db1;

1.3 Configurar application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/Prueba_db1
spring.datasource.username=postgres
spring.datasource.password=TU_CONTRASEÑA_AQUI
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
server.port=8080
jwt.secret=TU_CLAVE_JWT_BASE64
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.jdbc.time_zone=America/Guatemala

1.4 Ejecutar Migraciones
psql -U postgres -d Prueba_db1 -f src/main/resources/db/migration/V1__create_schema.sql
psql -U postgres -d Prueba_db1 -f src/main/resources/db/migration/V2__insert_sample_data.sql

1.5 Ejecutar el Backend
./mvnw clean install
./mvnw spring-boot:run


El backend estará disponible en http://localhost:8080.

</details> <details> <summary><strong>2. Frontend (React + Vite)</strong></summary>
2.1 Navegar a la Carpeta del Frontend
cd ../WokAsianFood-frontend/frontend

2.2 Instalar Dependencias
npm install
# Si hay errores:
npm install --legacy-peer-deps

2.3 Configurar Variables de Entorno
VITE_API_URL=http://localhost:8080

2.4 Ejecutar Servidor de Desarrollo
npm run dev


El frontend estará disponible en http://localhost:5173.

</details>
Configuración
CORS

Ya está configurado para aceptar peticiones desde http://localhost:5173.
Si cambias el puerto, actualiza:

.allowedOrigins("http://localhost:5173")

JWT Secret (Producción)

Genera una nueva clave JWT:

node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"


Reemplázala en application.properties.

Ejecución
Desarrollo Local
# Terminal 1
cd WokAsianFood-backend
./mvnw spring-boot:run

# Terminal 2
cd WokAsianFood-frontend/frontend
npm run dev

Producción
# Backend
./mvnw clean package
java -jar target/demo-0.0.1-SNAPSHOT.jar

# Frontend
npm run build

Usuarios de Prueba
Usuario	Contraseña	Rol	Descripción
admin	admin123	ADMIN	Acceso completo
mesero1	mesero123	MESERO	Gestión de órdenes y clientes
cocinero1	cocina123	COCINERO	Vista de cocina
cajero1	caja123	CAJERO	Facturación y pagos
encargado1	inventario123	ENCARGADO	Gestión de inventario

Nota: registra estos usuarios manualmente desde /api/auth/registrar o la interfaz de Admin.

Estructura del Proyecto
<details> <summary>Ver estructura completa</summary>
WokAsianFood/
├── backend/
│   ├── src/main/java/com/wokAsianF/demo/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── entity/
│   │   ├── service/
│   │   └── seguridad/
│   └── resources/db/migration/
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   ├── utils/
    │   └── App.tsx

</details>
API Endpoints
<details> <summary>Ver endpoints</summary>
Autenticación

POST /api/auth/login

POST /api/auth/registrar

Órdenes

GET /api/ordenes

POST /api/ordenes

PATCH /api/ordenes/{id}/servida

Cocina

GET /api/cocina/platillos

PATCH /api/cocina/platillos/{id}/listo

Platillos / Mesas / Clientes / Pagos / Usuarios / Estadísticas

(Consultar la documentación completa en /api/v1/...)

</details>
Licencia

Proyecto desarrollado con fines educativos.
Todos los derechos reservados.

Autores

Antony Javier Villatoro Gómez — AVillatoroG17
 — avillatorog17@gmail.com

Tomy Angelo Vargas Sales — TomyAnva
 — vtomy430@gmail.com

Edgar Fernando Vargas Sales — NigthmareCF
 — ferchocastfun15@gmail.com

Capturas de Pantalla

Login
<img width="1122" height="605" alt="image" src="https://github.com/user-attachments/assets/25740fb5-22e3-4629-b1f9-a3fd75826355" />


Dashboard de Mesero
<img width="1854" height="317" alt="image" src="https://github.com/user-attachments/assets/2b64bbfe-d621-4fcf-a172-573d3313ed1f" />
<img width="1878" height="839" alt="image" src="https://github.com/user-attachments/assets/faaa043c-0090-48a0-a3e3-f1a46e81df0d" />
<img width="1885" height="672" alt="image" src="https://github.com/user-attachments/assets/7cb7f39d-c0fe-45c8-947a-49b96bf3ee1e" />
<img width="1821" height="490" alt="image" src="https://github.com/user-attachments/assets/878c8637-0c8b-4703-9aac-d92744c40c1e" />
<img width="1895" height="826" alt="image" src="https://github.com/user-attachments/assets/77a28a19-5c59-48c4-9c13-5aa7a47ecb06" />
<img width="1911" height="857" alt="image" src="https://github.com/user-attachments/assets/2e54ca1f-d3ab-48a3-949c-9ed4e1ca58c4" />

Vista de Cocina
<img width="1882" height="823" alt="image" src="https://github.com/user-attachments/assets/75a7ae0a-332e-4d47-9953-d4e927d91de2" />

Cajero
<img width="1881" height="513" alt="image" src="https://github.com/user-attachments/assets/0e943d92-1e00-4f10-becc-e1602485bd9b" />
<img width="1871" height="893" alt="image" src="https://github.com/user-attachments/assets/4cb5a792-1b11-44f5-95a0-be8f39e4952e" />
<img width="1919" height="965" alt="image" src="https://github.com/user-attachments/assets/7ad99065-30b8-4d0e-8062-dc44b9ff4316" />

Admin
<img width="1877" height="685" alt="image" src="https://github.com/user-attachments/assets/22976126-e2fc-4f09-aaca-536ff12c1c73" />
<img width="1901" height="874" alt="image" src="https://github.com/user-attachments/assets/808400ce-2b88-4803-aecc-7a0d3939d809" />
<img width="1890" height="917" alt="image" src="https://github.com/user-attachments/assets/8e31cffc-01ee-499e-9e95-e0bc0609a965" />


  





