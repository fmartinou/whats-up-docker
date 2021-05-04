FROM node:14-alpine

LABEL maintainer="fmartinou"
EXPOSE 3000

ENV WORKDIR=/home/node/app
ENV WUD_LOG_FORMAT=text

WORKDIR /home/node/app

RUN mkdir /store

# Default entrypoint
COPY Docker.entrypoint.sh /usr/bin/entrypoint.sh
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["/usr/bin/entrypoint.sh"]

# Default Command
CMD ["node", "index"]

# Copy package.json
COPY package* ./

# Install dependendencies
RUN npm ci --production

# Copy app
COPY app/ ./