FROM node:18-slim

WORKDIR /usr/src/app

COPY ./aurora/ ./aurora/
COPY ./uWebSockets.js/ ./uWebSockets.js/
COPY ./vendor/lzma/ ./vendor/lzma/
COPY ./vendor/protobuf.min.js ./vendor/protobuf.min.js

EXPOSE 24567
CMD [ "node", "aurora/main.mjs" ]
