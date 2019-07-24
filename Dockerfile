FROM node:12-alpine

LABEL maintainer="fmartinou"
EXPOSE 3000

WORKDIR /home/node/app

# Default Command
CMD ["node", "index"]

# Copy package.json
COPY package* ./

# Copy app
COPY app/ ./

# Install dependendencies
RUN npm ci --production
