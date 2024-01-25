FROM node@sha256:0ded28778059262bd3c066b609186e5b6c89550a9362dce4309ad67c95af0d77

WORKDIR /sample-app
COPY package.json .
RUN npm install
COPY . .
CMD npm start
