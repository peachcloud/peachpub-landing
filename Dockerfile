FROM node:carbon

MAINTAINER Michael Williams <michael.williams@enspiral.com>

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .

USER node
EXPOSE 8901
ENTRYPOINT [ "/usr/src/app/bin.js" ]
