FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm install --global npm@10.9.2 \
    && npm ci

COPY frontend ./frontend
COPY backend ./backend
COPY scripts ./scripts
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    DEMO_MODE=false \
    PORT=3000 \
    APP_TIMEZONE=Asia/Kolkata
EXPOSE 3000

COPY --from=build /app/node_modules ./node_modules
COPY backend/package.json ./backend/package.json
COPY backend/src ./backend/src
COPY --from=build /app/frontend/dist ./frontend/dist

CMD ["node", "backend/src/server.js"]
