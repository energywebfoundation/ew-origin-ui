FROM node:10-alpine

USER root

RUN apk add --no-cache make gcc g++ openssh-client

RUN mkdir -p /src

WORKDIR /src
COPY . /src