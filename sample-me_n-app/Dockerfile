FROM node:21

WORKDIR /sample-app
COPY package.json .
RUN npm install
COPY . .
CMD npm start
