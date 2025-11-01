# Backend – FinderHub Admin API

เซิร์ฟเวอร์นี้พัฒนาโดยใช้ **Node.js + Express 5** สำหรับจัดการการยืนยันตัวตนของผู้ดูแลและบริการข้อมูลเบื้องต้น โดยมี MySQL เป็นฐานข้อมูลหลักและ Redis ใช้เก็บเซสชัน JWT

## ฟีเจอร์หลัก
- สมัครสมาชิก/ล็อกอินด้วยรหัสผ่าน (bcrypt) และออก JWT พร้อมเก็บ session ใน Redis
- ตรวจสอบข้อมูลผู้ใช้ปัจจุบัน (`/auth/me`)
- ดึงรายชื่อผู้ใช้งานทั้งหมดสำหรับแดชบอร์ด (`/auth/users`)
- Logout ทำลาย session ใน Redis
- มี endpoint `/health` สำหรับตรวจสอบสถานะเซิร์ฟเวอร์

## โครงสร้างโค้ด
```
backend/
├─ server.js                # จุดเริ่มต้นระบบ, bootstrap และตั้งค่า CORS
├─ Dockerfile               # ใช้รันแบบ dev ในคอนเทนเนอร์
├─ src/
│  ├─ authRoutes.js         # เส้นทาง /auth ทั้งหมด
│  ├─ db.js                 # สร้าง connection pool และ ensureTables
│  ├─ redisClient.js        # จัดการ Redis client
│  └─ middleware/
│     └─ auth.js            # ตรวจสอบ JWT + session ใน Redis
└─ package.json
```

## การติดตั้งและรันในโหมดพัฒนา
```bash
npm install
cp .env.example .env    # หากไม่มีให้สร้างตามรายการด้านล่าง
npm run dev             # ใช้ nodemon เฝ้าดูไฟล์
```
เซิร์ฟเวอร์จะเริ่มที่พอร์ต `4000` (สามารถปรับผ่านตัวแปร `PORT`)

## ตัวแปรแวดล้อมที่จำเป็น
| ตัวแปร | คำอธิบาย |
| --- | --- |
| `PORT` | พอร์ตของ Express (ค่าเริ่มต้น 4000) |
| `JWT_SECRET` | คีย์ลับใช้เซ็น JWT (ต้องกำหนดเอง) |
| `JWT_EXPIRES_IN` | อายุของโทเคน เช่น `15m`, `1h` |
| `BCRYPT_ROUNDS` | รอบการ hash bcrypt (ค่าแนะนำ 10-12) |
| `CORS_ORIGINS` | รายการ origin ที่อนุญาตคั่นด้วยคอมม่า (ตัวอย่าง `http://localhost:3000`) |
| `MYSQL_HOST` / `MYSQL_PORT` | ตำแหน่งบริการ MySQL |
| `MYSQL_USER` / `MYSQL_PASSWORD` | ผู้ใช้และรหัสผ่าน MySQL |
| `MYSQL_DATABASE` | ชื่อฐานข้อมูล (ค่าเริ่มต้น `finderhub`) |
| `MYSQL_CONNECTION_LIMIT` | จำนวน connection สูงสุดของ pool |
| `REDIS_HOST` / `REDIS_PORT` | ตำแหน่งบริการ Redis |
| `REDIS_URL` | (ทางเลือก) หากใช้งานในรูปแบบ URI เช่น `redis://redis:6379` |

> หากใช้ Docker Compose ค่าเริ่มต้นที่ตั้งไว้ใน `docker-compose.yml` จะสอดคล้องกับการตั้งค่าข้างต้น

## สคีมาฐานข้อมูล
`src/db.js` จะสร้างตารางโดยอัตโนมัติเมื่อเซิร์ฟเวอร์เริ่มทำงาน

### ตาราง `user`
| คอลัมน์ | ชนิด | รายละเอียด |
| --- | --- | --- |
| `id` | INT AUTO_INCREMENT | Primary key |
| `email` | VARCHAR(255) | อีเมลผู้ใช้ (unique) |
| `password_hash` | VARCHAR(255) | รหัสผ่านที่ถูก hash ด้วย bcrypt |
| `name` | VARCHAR(255) | ชื่อแสดงผล (อนุญาตค่า NULL) |
| `role` | VARCHAR(50) | บทบาท (`user`, `admin`) |
| `created_at` | TIMESTAMP | สร้างอัตโนมัติ |

ระบบจะ seed บัญชี `admin@1` (รหัสผ่าน `admin1234` โดยปรับ hash ไว้แล้ว) หากยังไม่มีข้อมูลในตาราง `user`

### ตาราง `item`
ใช้เป็นตัวอย่างข้อมูลสำหรับโมดูลในอนาคต
| คอลัมน์ | รายละเอียด |
| --- | --- |
| `name`, `found_date`, `location`, `image_url`, `description` | ข้อมูลของวัตถุที่พบ |
| `created_by`, `updated_by`, `deleted_by` | อ้างถึงผู้ใช้ที่กระทำ |
| `deleted_at` | เก็บเวลาลบแบบ soft delete |

## เส้นทาง API
| Method | Path | รายละเอียด | การยืนยัน |
| --- | --- | --- | --- |
| `GET` | `/health` | ตรวจสอบสถานะเซิร์ฟเวอร์ | ไม่ต้อง |
| `POST` | `/auth/register` | สมัครผู้ใช้ใหม่ | ไม่ต้อง |
| `POST` | `/auth/login` | ล็อกอิน รับ JWT + ข้อมูลผู้ใช้ | ไม่ต้อง |
| `POST` | `/auth/logout` | ลบเซสชันปัจจุบัน | ต้องมี Bearer token |
| `GET` | `/auth/me` | ดึงข้อมูลผู้ใช้จากโทเคน | ต้องมี Bearer token |
| `GET` | `/auth/users` | รายชื่อผู้ใช้ทั้งหมด | ต้องมี Bearer token |

ตัวอย่าง Header การยืนยัน
```
Authorization: Bearer <jwt-token>
```

## การทดสอบด้วย Curl (ตัวอย่าง)
```bash
# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@1","password":"admin"}'

# เรียกดูข้อมูลผู้ใช้ (ต้องนำ token จากผลลัพธ์ด้านบนมาใช้)
curl http://localhost:4000/auth/me \
  -H "Authorization: Bearer <token>"
```

## การ Build และรันใน Docker ภายในโฟลเดอร์ backend
```bash
docker build -t finderhub-backend .
docker run --rm -p 4000:4000 --env-file .env finderhub-backend
```

---
อย่าลืมดู `docker-compose.yml` ในโฟลเดอร์หลักหากต้องการสตาร์ตทุกบริการพร้อมกัน
