FROM node:22.8.0-slim

RUN apt update && apt install -y \
    jq curl make openssl procps \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g @nestjs/cli@10.4.8 \
    && npm install -g json-server@^0

USER node

WORKDIR /home/node/app

CMD [ "tail", "-f", "/dev/null" ]