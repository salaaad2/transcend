FROM node:latest

RUN mkdir -p /srv/app/overkillpong-client
WORKDIR /srv/app/overkillpong-client

COPY package.json /srv/app/overkillpong-client
COPY package-lock.json /srv/app/overkillpong-client

RUN npm install

COPY . .

EXPOSE 4000

CMD [ "npm", "start" ]
