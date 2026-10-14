FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

COPY . .

# Add a dummy variable so the Next.js static build doesn't crash
ENV MONGODB_URI="mongodb://dummy-build-uri"

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]