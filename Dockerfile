FROM node:14.15.5-alpine
ADD src /usr/app
WORKDIR /usr/app
RUN npm install
EXPOSE 3030
CMD [ "npm", "start" ]