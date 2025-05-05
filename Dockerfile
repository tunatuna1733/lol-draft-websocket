FROM oven/bun:latest

WORKDIR /app

COPY ./ ./

CMD ["bun", "run", "src/index.ts"]