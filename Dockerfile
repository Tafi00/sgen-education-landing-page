# Ảnh triển khai SGEN Education: build Vite + bundle server, chạy bằng Node 22.
# Giai đoạn 1 — build client (Vite) và server (esbuild → dist-server).
FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV npm_config_update_notifier=false
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Giai đoạn 2 — runtime chỉ giữ dependencies production + sản phẩm build.
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV UPLOAD_DIR=/app/uploads
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
# schema.sql nằm cạnh bundle để tiến trình tự áp schema PostgreSQL khi khởi động.
COPY --from=build /app/server/src/db/schema.sql ./dist-server/schema.sql
# Template PDF thần số học (18 trang + font Faustina) cho endpoint /api/lookups/:id/pdf.
COPY --from=build /app/server/assets/numerology-pdf ./assets/numerology-pdf
RUN mkdir -p /app/uploads
EXPOSE 3000
CMD ["node", "dist-server/index.js"]
