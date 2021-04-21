FROM node:12.18-alpine
RUN apk add --no-cache git
ENV NODE_ENV=production
WORKDIR /usr/src/app
# COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
COPY . .
RUN yarn
CMD yarn truffle develop