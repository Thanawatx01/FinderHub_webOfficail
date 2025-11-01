# FinderHub Web Official

โปรเจกต์นี้ประกอบด้วย Backend (Node.js + Express) และ Frontend (Next.js) สำหรับระบบจัดการผู้ดูแล FinderHub โดยใช้ MySQL เป็นฐานข้อมูลหลักและ Redis สำหรับเก็บสถานะการเข้าสู่ระบบ (JWT session)

## เทคโนโลยีหลัก
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4, shadcn/ui, TanStack Table, SweetAlert2
- **Backend**: Node.js, Express 5, MySQL2, Redis, JWT, bcrypt
- **Infrastructure**: Docker Compose (frontend, backend, mysql, redis)

## โครงสร้างโปรเจกต์
```
FinderHub_webOfficail /
├─ backend/      # REST API สำหรับยืนยันตัวตนและจัดการข้อมูลผู้ใช้
├─ frontend/     # แอป Next.js จัดการ UI และแดชบอร์ดผู้ดูแล
├─ docker-compose.yml
└─ README.md
```
## รัน Server พร้อมกันที่เดียว
docker-compose up --build

รายละเอียดเชิงลึกของแต่ละส่วนอยู่ที่ `backend/README.md` และ `frontend/README.md`

## เริ่มต้นอย่างรวดเร็วด้วย Docker
1. ตั้งค่าตัวแปรแวดล้อม:
   - หากมีไฟล์ `backend/.env.example` ให้คัดลอกเป็น `backend/.env` แล้วปรับค่า (ถ้าไม่มีให้สร้างไฟล์ `.env` เองตามตารางใน `backend/README.md`)
   - สร้าง `frontend/.env.local` และกำหนด `NEXT_PUBLIC_API_URL=http://backend:4000`
2. รันคำสั่งจากโฟลเดอร์รูท
   ```bash
   docker compose up --build
   ```
3. เมื่อคอนเทนเนอร์ทำงานเสร็จ ระบบจะพร้อมใช้งานที่
   - Frontend : <http://localhost:3000>
   - Backend API : <http://localhost:4000>
   - MySQL : พอร์ต `3306` (รหัสผ่านเริ่มต้น `example` ตาม docker-compose)
   - Redis : พอร์ต `6379`

## โหมดพัฒนา (รันแยกบริการ)
1. เปิด MySQL และ Redis (อาจใช้ Docker เช่นเดิม)
   ```bash
   docker compose up mysql redis -d
   ```
2. รัน Backend
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   > อย่าลืมสร้างไฟล์ `.env` ตามคำอธิบายใน `backend/README.md`

3. รัน Frontend
   ```bash
   cd frontend
   echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
   npm install
   npm run dev
   ```
4. เปิดเบราว์เซอร์ไปที่ <http://localhost:3000>

## เอกสารเพิ่มเติม
- [`backend/README.md`](backend/README.md) – รายละเอียด API, ตัวแปรแวดล้อม และขั้นตอนทดสอบ
- [`frontend/README.md`](frontend/README.md) – โครงสร้างหน้า UI, โฟลว์การล็อกอิน และคำสั่งสำหรับ build/deploy