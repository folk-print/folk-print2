# Maket order relay — tiny dependency-free Node service.
FROM node:22-alpine
WORKDIR /app
COPY index.mjs ./
ENV PORT=8090
EXPOSE 8090
CMD ["node", "index.mjs"]
