FROM node:18-alpine

WORKDIR /etc/hyperledger

RUN mkdir -p /etc/hyperledger
RUN mkdir -p /etc/hyperledger/wallet
RUN mkdir -p /etc/hyperledger/wallet/org1-wallet
RUN mkdir -p /etc/hyperledger/wallet/org2-wallet
RUN mkdir -p /etc/hyperledger/ccp

COPY package.json .

RUN npm install

COPY . /etc/hyperledger

EXPOSE 3010

CMD ["npm", "start"]