FROM node:7.9.0-alpine

ENV APP_DIR /usr/src/app/
RUN mkdir -p $APP_DIR
WORKDIR $APP_DIR

COPY package.json $APP_DIR
RUN npm install --silent --depth 0

COPY ./src $APP_DIR/src

CMD npm start