FROM node:18
COPY server.js .
COPY build ./build
COPY scripts ./scripts
COPY package.json .
RUN npm install
EXPOSE  8080
CMD ["node", "server.js"]
