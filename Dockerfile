# ✅ ใช้ Node.js 22 (ตรงกับที่บอทใช้)
FROM node:22

# ✅ ตั้งค่า working directory
WORKDIR /app

# ✅ คัดลอกไฟล์ทั้งหมดเข้า container
COPY . .

# ✅ ติดตั้ง dependencies
RUN npm install

# ✅ เปิดพอร์ต 3000 ให้ express uptime ใช้งานได้
EXPOSE 3000

# ✅ รันบอท
CMD ["node", "index.js"]
