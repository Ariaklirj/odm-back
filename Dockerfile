# Dockerfile

# 1. Imagen base
FROM node:18-alpine

# 2. Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiamos sólo package.json y package-lock.json (si lo tuvieras)
COPY package*.json ./

# 4. Instalamos dependencias (producción)
RUN npm install --production

# 5. Copiamos el resto del código
COPY . .

# 6. Declaramos la variable de entorno (opcional)
ENV NODE_ENV=production

# 7. Exponemos el puerto que usará Express
EXPOSE 5001

# 8. Comando por defecto para arrancar el servidor
CMD ["npm", "start"]
