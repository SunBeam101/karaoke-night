FROM node:alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

# COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]