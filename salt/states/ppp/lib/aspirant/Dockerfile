FROM node:18-bullseye
RUN apt-get --assume-yes update && apt-get --assume-yes install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY ./aspirant/ ./aspirant/
COPY ./uWebSockets.js/ ./uWebSockets.js/
COPY ./canvas/ ./canvas/
COPY ./canvas-table/ ./canvas-table/
COPY ./fonts/ ./fonts/
COPY ./pg/ ./pg/
COPY ./pdfjs/ ./pdfjs/
COPY ./ssh2/ ./ssh2/
COPY ./websocket/ ./websocket/
COPY ./vendor/lzma/ ./vendor/lzma/
COPY ./vendor/protobuf.min.js ./vendor/protobuf.min.js
COPY ./vendor/redis.min.js ./vendor/redis.min.js

EXPOSE 32456
EXPOSE 9229

CMD [ "node", "--no-warnings", "--inspect=0.0.0.0:9229", "aspirant/main.mjs" ]
