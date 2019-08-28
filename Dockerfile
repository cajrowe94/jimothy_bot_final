FROM node:10
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . ./
EXPOSE 8080
CMD ["node", "bot.js"]
