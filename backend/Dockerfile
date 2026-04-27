FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ensure uploads folder exists (empty)
RUN mkdir -p public/uploads/images \
    public/uploads/pdfs \
    public/uploads/thumbnails

RUN npx prisma generate

EXPOSE 8000

CMD ["npm", "start"]