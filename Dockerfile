FROM node:8

ADD package.json /tmp/package.json
RUN cd /tmp && npm install

ADD src /tmp/src
ADD tsconfig.json /tmp
RUN cd /tmp && npm run build

RUN mkdir -p /opt/app && cp -a /tmp/dist/* /tmp/node_modules /opt/app

WORKDIR /opt/app
ADD proxyConfig.json /opt/app

EXPOSE 3000

ENTRYPOINT ["node", "server.js"]
