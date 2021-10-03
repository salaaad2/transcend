FROM node:latest

RUN mkdir -p /srv/app/overkillpong-server
WORKDIR /srv/app/overkillpong-server

COPY package.json /srv/app/overkillpong-server
COPY package-lock.json /srv/app/overkillpong-server

RUN npm install

COPY . .

CMD [ "npm", "start", "dev" ]
