# Travel Planner API

API REST desarrollada con NestJS para la planificación de viajes. Permite gestionar información de países consumiendo datos de RestCountries API y crear planes de viaje asociados a países específicos, utilizando SQLite como sistema de caché local.

## Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Arquitectura](#arquitectura)
- [Endpoints](#endpoints)
- [Modelo de Datos](#modelo-de-datos)
- [Provider Externo](#provider-externo)
- [Pruebas Básicas](#pruebas-básicas)
- [Extensión del API Parcial](#extensión-del-api-parcial-70)

## Requisitos Previos

- Node.js (v16 o superior)
- npm (v7 o superior)

## Instalación

```bash
npm install
```

### Dependencias Principales

- @nestjs/core, @nestjs/common: Framework base
- @nestjs/typeorm, typeorm, sqlite3: ORM y base de datos
- @nestjs/axios, axios: Cliente HTTP para consumir APIs externas
- class-validator, class-transformer: Validación de datos en DTOs

## Configuración

### Base de Datos

El proyecto utiliza SQLite como base de datos. La configuración se encuentra en `src/app.module.ts`:

```typescript
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
})
```

El archivo `database.sqlite` se crea automáticamente en la raíz del proyecto al ejecutar la aplicación por primera vez. La opción `synchronize: true` crea las tablas automáticamente basándose en las entidades definidas.

## Ejecución

### Modo Desarrollo

```bash
npm run start:dev
```

La API estará disponible en `http://localhost:3000`

### Modo Producción

```bash
npm run build
npm run start:prod
```

## Arquitectura

La aplicación está organizada en dos módulos principales:

### CountriesModule

Módulo encargado de gestionar la información de países. Implementa un sistema de caché que consulta primero la base de datos local y, si el país no existe, lo obtiene desde la API externa de RestCountries, lo almacena en la base de datos y lo devuelve.

**Componentes:**
- `CountriesController`: Maneja las rutas HTTP relacionadas con países
- `CountriesService`: Contiene la lógica de negocio y gestión del caché
- `RestCountriesApiService`: Provider que encapsula las llamadas a la API externa
- `Country`: Entidad que representa la tabla de países en la base de datos

### TravelPlansModule

Módulo dedicado a la gestión de planes de viaje. Cada plan está asociado a un país específico mediante su código alpha-3. Antes de crear un plan, verifica que el país exista en el sistema, utilizando el módulo de países para obtenerlo si es necesario.

**Componentes:**
- `TravelPlansController`: Maneja las rutas HTTP de planes de viaje
- `TravelPlansService`: Implementa la lógica para crear y consultar planes
- `TravelPlan`: Entidad que representa la tabla de planes de viaje

## Endpoints

### Countries

#### Listar todos los países en caché

```
GET /countries
```

Retorna todos los países almacenados en la base de datos local.

**Respuesta de ejemplo:**
```json
[
  {
    "code": "COL",
    "name": "Colombia",
    "region": "Americas",
    "subregion": "South America",
    "capital": "Bogotá",
    "population": 50882884,
    "flagUrl": "https://flagcdn.com/w320/co.png",
    "source": "cache",
    "createdAt": "2025-11-20T10:30:00.000Z",
    "updatedAt": "2025-11-20T10:30:00.000Z"
  }
]
```

#### Consultar país por código

```
GET /countries/:code
```

Busca un país por su código alpha-3. Si el país existe en la base de datos, lo devuelve indicando `source: "cache"`. Si no existe, lo consulta desde RestCountries API, lo guarda en la base de datos y lo devuelve indicando `source: "api"`.

**Parámetros:**
- `code`: Código alpha-3 del país (ej: COL, USA, FRA)

**Respuesta de ejemplo (primera consulta):**
```json
{
  "code": "COL",
  "name": "Colombia",
  "region": "Americas",
  "subregion": "South America",
  "capital": "Bogotá",
  "population": 50882884,
  "flagUrl": "https://flagcdn.com/w320/co.png",
  "source": "api",
  "createdAt": "2025-11-20T10:30:00.000Z",
  "updatedAt": "2025-11-20T10:30:00.000Z"
}
```

**Respuesta de ejemplo (consultas posteriores):**
```json
{
  "source": "cache"
}
```

### Travel Plans

#### Crear un plan de viaje

```
POST /travel-plans
```

Crea un nuevo plan de viaje asociado a un país. Valida que el país exista en el sistema y que las fechas sean válidas.

**Body:**
```json
{
  "countryCode": "COL",
  "title": "Vacaciones en Colombia",
  "startDate": "2025-12-01",
  "endDate": "2025-12-15",
  "notes": "Visitar Cartagena, Bogotá y Medellín"
}
```

**Validaciones:**
- `countryCode`: Debe ser exactamente 3 letras mayúsculas
- `title`: Obligatorio, no puede estar vacío
- `startDate`: Formato ISO (YYYY-MM-DD)
- `endDate`: Formato ISO, debe ser posterior o igual a startDate
- `notes`: Opcional

**Respuesta:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "countryCode": "COL",
  "country": {
    "code": "COL",
    "name": "Colombia",
    "region": "Americas",
    "capital": "Bogotá",
    "flagUrl": "https://flagcdn.com/w320/co.png"
  },
  "title": "Vacaciones en Colombia",
  "startDate": "2025-12-01T00:00:00.000Z",
  "endDate": "2025-12-15T00:00:00.000Z",
  "notes": "Visitar Cartagena, Bogotá y Medellín",
  "createdAt": "2025-11-20T10:35:00.000Z"
}
```

#### Listar todos los planes de viaje

```
GET /travel-plans
```

Retorna todos los planes de viaje registrados, incluyendo la información del país asociado.

#### Consultar un plan específico

```
GET /travel-plans/:id
```

Retorna un plan de viaje específico por su identificador UUID.

**Parámetros:**
- `id`: Identificador UUID del plan

## Modelo de Datos

### Country

Entidad que representa un país en la base de datos.

```typescript
{
  code: string;           // Código alpha-3 (PK)
  name: string;           // Nombre del país
  region: string;         // Región geográfica
  subregion: string;      // Subregión
  capital: string;        // Capital
  population: number;     // Población
  flagUrl: string;        // URL de la bandera
  createdAt: Date;        // Fecha de creación
  updatedAt: Date;        // Fecha de última actualización
}
```

### TravelPlan

Entidad que representa un plan de viaje.

```typescript
{
  id: string;             // UUID (PK)
  countryCode: string;    // Código del país (FK)
  country: Country;       // Relación con Country
  title: string;          // Título del viaje
  startDate: Date;        // Fecha de inicio
  endDate: Date;          // Fecha de fin
  notes: string;          // Notas opcionales
  createdAt: Date;        // Fecha de creación
}
```

La relación entre `TravelPlan` y `Country` se establece mediante el campo `countryCode` que referencia al campo `code` de la tabla de países.

## Provider Externo

### RestCountriesApiService

El proyecto implementa un provider especializado que encapsula las llamadas a la API externa de RestCountries. Este patrón permite separar la lógica de negocio de los detalles de implementación de la infraestructura.

**Características:**

1. **Interfaz definida**: Se define un contrato `ICountriesApiService` que especifica las operaciones disponibles.

2. **Implementación específica**: `RestCountriesApiService` implementa esta interfaz consumiendo la API de RestCountries.

3. **Optimización de consultas**: Las peticiones a RestCountries incluyen el parámetro `fields` para limitar los datos recibidos:
   ```
   https://restcountries.com/v3.1/alpha/COL?fields=cca3,name,region,subregion,capital,population,flags
   ```

4. **Inyección de dependencias**: El provider se registra en el módulo usando un token personalizado y se inyecta en el servicio de países mediante `@Inject('COUNTRIES_API_SERVICE')`.

**Ventajas de este enfoque:**
- Facilita el testing mediante la creación de mocks
- Permite cambiar la implementación sin modificar el servicio de países
- Separa claramente las responsabilidades entre lógica de negocio e infraestructura

## Pruebas Básicas

### Consultar un país no cacheado

**Request:**
```
GET http://localhost:3000/countries/COL
```

**Comportamiento esperado:**
- El país no existe en la base de datos
- Se consulta la API de RestCountries
- Se guarda en la base de datos
- Se retorna con `source: "api"`

### Consultar un país cacheado

**Request:**
```
GET http://localhost:3000/countries/COL
```

**Comportamiento esperado:**
- El país existe en la base de datos (de la consulta anterior)
- Se retorna directamente desde la base de datos
- Se retorna con `source: "cache"`
- No se hace llamada a la API externa

### Crear un plan de viaje con país nuevo

**Request:**
```
POST http://localhost:3000/travel-plans
Content-Type: application/json

{
  "countryCode": "ESP",
  "title": "Viaje a España",
  "startDate": "2026-06-01",
  "endDate": "2026-06-20",
  "notes": "Madrid, Barcelona y Valencia"
}
```

**Comportamiento esperado:**
- El sistema verifica que ESP exista
- Como no está en caché, lo consulta de RestCountries
- Guarda el país en la base de datos
- Crea el plan de viaje
- Retorna el plan con la información del país

### Crear un plan con validaciones incorrectas

**Request con fechas inválidas:**
```
POST http://localhost:3000/travel-plans
Content-Type: application/json

{
  "countryCode": "COL",
  "title": "Plan con fechas incorrectas",
  "startDate": "2025-12-15",
  "endDate": "2025-12-01"
}
```

**Respuesta esperada (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "End date must be after or equal to start date",
  "error": "Bad Request"
}
```

**Request con código de país inválido:**
```json
{
  "countryCode": "co",
  "title": "Plan con código incorrecto",
  "startDate": "2025-12-01",
  "endDate": "2025-12-15"
}
```

**Respuesta esperada (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": [
    "Country code must be 3 uppercase letters (e.g., COL, USA, FRA)"
  ],
  "error": "Bad Request"
}
```

## Extensión del API (Parcial 70%)

### Descripción de la Extensión

Se amplió la funcionalidad del API incorporando capacidades de eliminación controlada de países del sistema de caché, protección mediante autorización basada en tokens y registro detallado de actividad. La extensión respeta completamente la arquitectura modular establecida en el preparcial, agregando un nuevo endpoint DELETE al CountriesModule, implementando un guard de autorización para proteger operaciones sensibles y añadiendo un middleware de logging que registra todas las peticiones realizadas a los módulos principales de la aplicación.

Las modificaciones incluyen validaciones adicionales que previenen la eliminación de países que tienen planes de viaje asociados, garantizando la integridad referencial de los datos. El sistema de autorización implementado mediante guards permite controlar el acceso a operaciones críticas, mientras que el middleware de logging proporciona trazabilidad completa de todas las operaciones realizadas en el sistema, registrando método HTTP, ruta, código de estado y tiempo de procesamiento de cada petición.

---

### Endpoint Protegido - DELETE /countries/:code

#### Descripción

Permite eliminar un país de la base de datos local (caché) únicamente si no existen planes de viaje asociados a él y si la petición incluye un token de autorización válido.

#### Autorización Requerida

El endpoint requiere el header `x-api-token` con el valor correcto para permitir la operación.

```
x-api-token: clase-web-2025-seguro
```

#### Casos de Uso y Validación

**1. Eliminar país sin token (Debe Fallar - 401 Unauthorized):**

```
DELETE http://localhost:3000/countries/FRA
```

**Respuesta:**
```json
{
  "statusCode": 401,
  "message": "API token is required",
  "error": "Unauthorized"
}
```

**2. Eliminar país con token incorrecto (Debe Fallar - 401 Unauthorized):**

```
DELETE http://localhost:3000/countries/FRA
Headers:
  x-api-token: token-incorrecto
```

**Respuesta:**
```json
{
  "statusCode": 401,
  "message": "Invalid API token",
  "error": "Unauthorized"
}
```

**3. Eliminar país que no existe en caché (Debe Fallar - 404 Not Found):**

```
DELETE http://localhost:3000/countries/XXX
Headers:
  x-api-token: clase-web-2025-seguro
```

**Respuesta:**
```json
{
  "statusCode": 404,
  "message": "Country with code XXX not found in cache",
  "error": "Not Found"
}
```

**4. Eliminar país con planes de viaje asociados (Debe Fallar - 400 Bad Request):**

Primero crear un plan asociado:
```
POST http://localhost:3000/travel-plans
Content-Type: application/json

{
  "countryCode": "COL",
  "title": "Vacaciones",
  "startDate": "2025-12-01",
  "endDate": "2025-12-15"
}
```

Luego intentar eliminar el país:
```
DELETE http://localhost:3000/countries/COL
Headers:
  x-api-token: clase-web-2025-seguro
```

**Respuesta:**
```json
{
  "statusCode": 400,
  "message": "Cannot delete country COL. There are travel plans associated with it.",
  "error": "Bad Request"
}
```

**5. Eliminar país exitosamente (Debe Funcionar - 200 OK):**

Primero consultar un país nuevo sin planes asociados:
```
GET http://localhost:3000/countries/FRA
```

Luego eliminarlo:
```
DELETE http://localhost:3000/countries/FRA
Headers:
  x-api-token: clase-web-2025-seguro
```

**Respuesta:**
```json
{
  "message": "Country FRA successfully removed from cache"
}
```

---

### Guard de Autorización

#### Descripción

El `ApiTokenGuard` es un guard personalizado que valida la presencia y validez del token de autorización en el header de las peticiones.

#### Funcionamiento

1. **Intercepta la petición**: Antes de que llegue al controlador, el guard examina los headers de la petición.
2. **Valida presencia del token**: Verifica que el header `x-api-token` esté presente.
3. **Valida el valor del token**: Compara el token recibido con el token válido configurado.
4. **Permite o deniega acceso**: Si el token es válido, permite continuar; caso contrario, lanza una excepción `UnauthorizedException`.

#### Implementación

El guard se aplica únicamente al endpoint DELETE mediante el decorador `@UseGuards(ApiTokenGuard)`:

```typescript
@Delete(':code')
@UseGuards(ApiTokenGuard)
async remove(@Param('code') code: string) {
  return this.countriesService.remove(code);
}
```

#### Validación del Guard

Para validar que el guard funciona correctamente:

1. **Sin token**: La petición debe ser rechazada con código 401 y mensaje "API token is required"
2. **Token incorrecto**: La petición debe ser rechazada con código 401 y mensaje "Invalid API token"
3. **Token correcto**: La petición debe continuar normalmente y ejecutar la lógica del endpoint

---

### Middleware de Logging

#### Descripción

El `LoggingMiddleware` registra información detallada de cada petición HTTP procesada por el API, proporcionando trazabilidad y facilitando la depuración.

#### Funcionamiento

1. **Intercepta peticiones entrantes**: El middleware se ejecuta antes de que la petición llegue al controlador.
2. **Registra tiempo de inicio**: Captura el timestamp al inicio del procesamiento.
3. **Permite continuar el flujo**: Llama a `next()` para que la petición continúe su procesamiento normal.
4. **Escucha el evento 'finish'**: Cuando la respuesta está lista para ser enviada, calcula métricas.
5. **Registra información completa**: Imprime en consola el log con todos los detalles de la petición.

#### Información Registrada

Cada log incluye:
- **Timestamp**: Fecha y hora exacta en formato ISO
- **Método HTTP**: GET, POST, DELETE, etc.
- **Ruta**: URL completa de la petición
- **Código de estado**: Código HTTP de la respuesta (200, 404, 401, etc.)
- **Tiempo de procesamiento**: Duración total en milisegundos

#### Formato del Log

```
[2025-11-21T15:04:52.409Z] GET /countries - Status: 200 - Time: 5ms
```

#### Rutas Monitoreadas

El middleware está configurado para aplicarse a:
- Todas las rutas de `/countries`
- Todas las rutas de `/travel-plans`

#### Validación del Middleware

Para verificar que el middleware funciona correctamente:

1. **Iniciar la aplicación** y observar la consola
2. **Realizar cualquier petición** a `/countries` o `/travel-plans`
3. **Verificar que aparezca el log** en la consola con el formato especificado
4. **Confirmar que incluye**: timestamp, método, ruta, código de estado y tiempo

**Nota: Adicionalmente se provee un archivo con el suite de pruebas para ejecutar en Postman con el fin de hacer el proceso de testing más sencillo (ParcialWEB.postman_collection).**