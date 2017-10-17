FROM node:8

COPY package.json /opt/app/package.json
RUN cd /opt/app && npm install

COPY src /opt/app/src
RUN cd /opt/app && npm run build

COPY config /opt/app/config

WORKDIR /opt/app

CMD ["npm", "start"]
