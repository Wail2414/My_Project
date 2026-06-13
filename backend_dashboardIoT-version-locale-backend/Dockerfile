# Use the official Node.js image as a base
 
FROM node:22.14.0
 
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
 

 
