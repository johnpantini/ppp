Build:

# cd salt/states/ppp/lib
# docker build . -t johnpantini/aspirant -f aspirant\Dockerfile
# docker ps

Copy files:

# docker cp <containerId>:/app/node_modules/canvas/build/Release/canvas.node .

Test (add to start.sh):

# node -e "console.log(require('./canvas/index.js').createCanvas)"
# sleep Infinity

View files (Ctrl-Z to exit): 

# docker exec -t -i <containerName> /bin/sh
