FROM node:16-alpine

LABEL maintainer="fmartinou"
EXPOSE 3000

ARG WUD_VERSION=unknown

ENV WORKDIR=/home/node/app
ENV WUD_LOG_FORMAT=text
ENV WUD_VERSION=$WUD_VERSION

WORKDIR /home/node/app

RUN mkdir /store

# Default entrypoint
COPY Docker.entrypoint.sh /usr/bin/entrypoint.sh
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["/usr/bin/entrypoint.sh"]

# Default Command
CMD ["node", "index"]

# Add TZDATA to allow easy local time configuration
RUN apk update \
    && apk add tzdata \
    && apk add openssl \
    && rm -rf /var/cache/apk/*

# Copy app package.json
COPY app/package* ./

# Install dependencies
RUN npm ci --production

# Copy app
COPY app/ ./

# Copy ui
COPY ui/dist/ ./ui