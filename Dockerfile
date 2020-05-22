ARG BASE_IMAGE=node:current-alpine
FROM $BASE_IMAGE

LABEL maintainer="fmartinou"
EXPOSE 3000

WORKDIR /home/node/app

RUN mkdir /store

# Default Command
CMD ["node", "index"]

# Copy package.json
COPY package* ./

# Copy app
COPY app/ ./

# Install dependendencies
RUN npm ci --production
