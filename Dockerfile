# Build stage for Client
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Production stage for Server
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install --production
COPY server/ ./server/
COPY --from=client-build /app/client/dist ./client/dist

# Expose port (default for the app is 5000)
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

WORKDIR /app/server
CMD ["node", "src/index.js"]
