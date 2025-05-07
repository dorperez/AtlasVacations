FROM node:latest

WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm install -g nodemon

EXPOSE 3000

CMD ["nodemon", "index.js"]