# -------------------------
# 1. Base Image
# -------------------------
FROM node:20-alpine

# -------------------------
# 2. App Directory
# -------------------------
WORKDIR /app

# -------------------------
# 3. Install dependencies first (cache optimization)
# -------------------------
COPY package*.json ./

RUN npm install

# -------------------------
# 4. Copy project files
# -------------------------
COPY . .

# -------------------------
# 5. Generate Prisma Client
# -------------------------
RUN npx prisma generate

# -------------------------
# 6. Expose port
# -------------------------
EXPOSE 8000

# -------------------------
# 7. Start app (PRODUCTION)
# -------------------------
CMD ["npm", "start"]