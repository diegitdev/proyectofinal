# Proyecto Final (Luxury Scents)

Este proyecto es una aplicación web de ejemplo que consta de un backend desarrollado con Spring Boot y un frontend desarrollado con React y Vite, servido por Nginx. La aplicación está diseñada para ser ejecutada utilizando Docker Compose o Podman Compose.

## Descripción

(Aquí puedes añadir una descripción más detallada de la aplicación, por ejemplo: "Este proyecto simula una tienda de perfumes en línea, permitiendo a los usuarios navegar por productos, gestionar un carrito de compras y realizar pedidos.")

## Requisitos Previos

Antes de empezar, asegúrate de tener instalado lo siguiente:

*   **Git:** Para clonar el repositorio.
*   **Docker** o **Podman**: Para construir y ejecutar los contenedores.
*   **Docker Compose** (si usas Docker) o **podman-compose** (si usas Podman): Para orquestar los contenedores. Si usas Podman, puedes instalar `podman-compose` con `pip install podman-compose`.

## Configuración

1.  Clona el repositorio:
    ```bash
    git clone <URL_del_repositorio>
    cd proyectofinal # O el nombre de tu carpeta principal
    ```

2.  Asegúrate de que los subdirectorios `backend` y `front` contengan el código fuente respectivo. En este proyecto, el backend está en la raíz (`./`) y el frontend está en `./front`.

3.  Asegúrate de tener los archivos de configuración necesarios para Docker en las ubicaciones correctas:
    *   `Dockerfile` para el backend en la raíz del proyecto (`./Dockerfile`).
    *   `Dockerfile` para el frontend en el directorio `./front/Dockerfile`.
    *   `nginx.conf` para el frontend en el directorio `./front/nginx.conf`.
    *   `docker-compose.yml` en la raíz del proyecto (`./docker-compose.yml`).

## Ejecución del Proyecto

Para construir las imágenes de Docker/Podman y levantar los contenedores, navega a la raíz del proyecto donde se encuentra `docker-compose.yml` y ejecuta el siguiente comando:

Si usas Docker Compose:
```bash
docker-compose up -d --build
```

Si usas Podman Compose:
```bash
podman-compose up -d --build
```

*   `up`: Inicia los servicios definidos en `docker-compose.yml`.
*   `-d`: Ejecuta los contenedores en modo "detached" (en segundo plano).
*   `--build`: Construye las imágenes de los servicios antes de iniciarlos.

Una vez que los contenedores estén en funcionamiento, podrás acceder a:

*   **Frontend:** `http://localhost:3000`
*   **Backend API:** `http://localhost:8080`

Para detener los servicios, ejecuta:

Si usas Docker Compose:
```bash
docker-compose down
```

Si usas Podman Compose:
```bash
podman-compose down
```

## Estructura del Proyecto (Simplificada)

```
.
├── Dockerfile         # Dockerfile para el servicio backend
├── docker-compose.yml # Definición de los servicios y red
├── pom.xml            # Archivo POM de Maven para el backend
├── src/               # Código fuente del backend (Java/Spring Boot)
│   └── main/
│       └── java/
│           └── com/example/proyectofinal/
│               ├── config/
│               ├── controller/
│               ├── dto/
│               ├── exception/
│               ├── model/
│               ├── repository/
│               └── service/
└── front/             # Código fuente del frontend (React/Vite)
    ├── Dockerfile     # Dockerfile para el servicio frontend
    ├── nginx.conf     # Configuración de Nginx para servir el frontend
    ├── package.json   # Dependencias y scripts del frontend
    └── src/           # Código fuente de la aplicación React
```

## Tecnologías Utilizadas

**Backend:**

*   Spring Boot
*   Java
*   Maven
*   Spring Security
*   Spring Data JPA
*   Base de Datos H2 (configurada en memoria para desarrollo)

**Frontend:**

*   React
*   Vite
*   JavaScript/JSX
*   Axios (para peticiones HTTP)
*   Material UI (`@mui`)
*   React Router
*   Nginx (servidor web para archivos estáticos)

**Contenedores:**

*   Docker / Podman
*   Docker Compose / Podman Compose
