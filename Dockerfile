FROM node:6

ADD ./ /app
WORKDIR /app

RUN npm install -d --registry https://registry.npm.taobao.org
RUN npm run build

EXPOSE 9000

CMD npm start
