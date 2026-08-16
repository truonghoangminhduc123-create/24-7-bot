# Sử dụng Node.js 24 bản Alpine nhẹ nhất
FROM node:24-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json trước
COPY package*.json ./

# Cài đặt thư viện
RUN npm install --production

# Copy toàn bộ code vào container
COPY . .

# Mở port cho Express (ví dụ 8080) để UptimeRobot ping
EXPOSE 8080

# Lệnh chạy bot
CMD ["npm", "start"]

