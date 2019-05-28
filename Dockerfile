FROM node:10-alpine

USER root

RUN apk add --no-cache make gcc g++ openssh-client
RUN apk add --no-cache python && \
    python -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip install --upgrade pip setuptools && \
    rm -r /root/.cache
RUN apk add --no-cache git

RUN mkdir -p /src

COPY . /src
WORKDIR /src

RUN rm -rf node_modules && npm config set unsafe-perm true && npm install && npm run build