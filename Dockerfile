FROM node:14.15-alpine
RUN yarn global add ganache-cli
RUN apk add --no-cache git curl
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install
COPY . .
# RUN yarn
CMD /bin/sh