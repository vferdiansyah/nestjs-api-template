FROM node:20-alpine3.20

WORKDIR /app

COPY package*.json ./

RUN npm pkg delete scripts.prepare && npm ci

COPY . .

CMD [ "npm", "start" ]