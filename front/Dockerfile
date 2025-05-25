# Etapa 1: Construcción de la aplicación frontend
# Usamos una imagen base de Node.js. La versión 18 es compatible con tu proyecto.
FROM node:18 AS builder

# Establecemos el directorio de trabajo dentro de esta etapa del contenedor.
WORKDIR /app

# Copiamos los archivos package.json y package-lock.json.
# Hacemos esto primero para que Docker pueda cachear esta capa si solo cambian los archivos fuente.
COPY package*.json ./

# Instalamos las dependencias del proyecto.
# Aquí es donde npm lee el package.json y package-lock.json y descarga los módulos.
# Los errores de compatibilidad de dependencias (como el de @mui/utils que vimos)
# deben resolverse en tu máquina local limpiando node_modules y package-lock.json
# y reinstalando antes de reconstruir la imagen Docker.
RUN npm install

# Copiamos el resto del código fuente del frontend.
COPY . .

# Ejecutamos el script de construcción de Vite.
# Este comando compilará tu aplicación para producción y, por defecto, colocará los archivos estáticos en el directorio 'dist'
RUN npm run build

# Etapa 2: Servir los archivos estáticos con Nginx
# Usamos una imagen ligera de Nginx para servir la aplicación compilada.
FROM nginx:alpine

# Copiamos los archivos de la build (generados en la etapa 'builder') al directorio
# donde Nginx busca los archivos para servir páginas web.
# ¡Asegúrate de que '/app/dist' coincide con el directorio de salida de 'npm run build'!
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiamos el archivo de configuración de Nginx personalizado al directorio conf.d para que sea incluido.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto por defecto de Nginx (puerto 80).
EXPOSE 80

# Comando para iniciar Nginx cuando el contenedor se ejecute.
CMD ["nginx", "-g", "daemon off;"]
