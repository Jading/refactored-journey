FROM node:14.15-alpine
RUN yarn global add ganache-cli
ENV NODE_ENV=production
WORKDIR /usr/src/app
CMD /bin/sh