# -------------------------
# 1. Base Image
# -------------------------
FROM node:20-alpine

# -------------------------
# 2. App Directory
# -------------------------
WORKDIR /app

# -------------------------
# 3. Install dependencies
# -------------------------
COPY package*.json ./
RUN npm install

# -------------------------
# 4. Copy only required files (IMPORTANT)
# -------------------------
COPY src ./src
COPY prisma ./prisma

# ⚠️ public folder intentionally NOT copied

# -------------------------
# 5. Create uploads folder (safe fallback)
# -------------------------
RUN mkdir -p public/uploads/images \
    public/uploads/pdfs \
    public/uploads/thumbnails

# -------------------------
# 6. Prisma
# -------------------------
RUN npx prisma generate

# -------------------------
# 7. Expose port
# -------------------------
EXPOSE 8000

# -------------------------
# 8. Start app
# -------------------------
CMD ["npm", "start"]