# Gunakan base image Node.js
FROM node:18

# Set working directory
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin seluruh isi project
COPY . .

# Ekspose port aplikasi (ubah jika berbeda)
EXPOSE 3000

# Jalankan aplikasi
CMD ["node", "index.js"]
