# Frontend – FinderHub Admin UI

แอปนี้พัฒนาด้วย **Next.js 15 (App Router)** เพื่อแสดงหน้าล็อกอินและแดชบอร์ดผู้ดูแล พร้อม UI component จาก shadcn/ui และระบบธีมแบบ light/dark

## ฟีเจอร์เด่น
- หน้า **ล็อกอิน** แสดง SweetAlert2 เมื่อสำเร็จ/ผิดพลาด และบันทึก JWT ลง Cookie ด้วย `js-cookie`
- เลย์เอาต์ **แดชบอร์ดผู้ดูแล** มี sidebar ย่อตัวได้, breadcrumb อัตโนมัติ, ปุ่มเปลี่ยนธีม, และตารางรายชื่อผู้ใช้ (TanStack Table)
- ตรวจสอบ session ฝั่ง client ด้วย `/auth/me` และ redirect กลับหน้า login เมื่อ JWT หมดอายุ
- หน้า **404 (not-found)** พร้อมปุ่มย้อนกลับและกลับหน้าหลัก

## โครงสร้างไดเรกทอรีที่สำคัญ
```
frontend/
├─ src/app/
│  ├─ (auth)/login/page.tsx     # หน้าเข้าสู่ระบบ
│  ├─ admin/layout.tsx          # Layout ป้องกันสิทธิ์สำหรับแดชบอร์ด
│  ├─ admin/page.tsx            # หน้าแดชบอร์ดหลัก (โหลดข้อมูลผู้ใช้แบบ client)
│  ├─ layout.tsx                # Root layout + ThemeProvider
│  ├─ not-found.tsx             # หน้า 404
│  └─ globals.css               # Global styles (Tailwind v4)
├─ src/components/
│  ├─ admin/                    # shell, user table, sidebar
│  ├─ ui/                       # ปุ่ม, input, table, breadcrumb, sidebar primitives
│  └─ mode-toggle.tsx           # เปลี่ยนธีม
├─ src/lib/                     # helper (api-client, token, backend url, server-auth)
└─ package.json
```

## การตั้งค่าตัวแปรแวดล้อม
สร้างไฟล์ `frontend/.env.local` และกำหนดค่าอย่างน้อย
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```
หากเรียกใช้ผ่าน Docker ใช้ค่า `http://backend:4000`

## การติดตั้งและเริ่มพัฒนา
```bash
npm install
npm run dev
```
เปิดเบราว์เซอร์ที่ <http://localhost:3000>

### สคริปต์ที่ใช้บ่อย
| คำสั่ง | รายละเอียด |
| --- | --- |
| `npm run dev` | รัน Next.js แบบพัฒนา |
| `npm run build` | สร้าง production build |
| `npm run start` | รัน production build ที่ถูก build แล้ว |
| `npm run lint` | ตรวจสอบโค้ดด้วย ESLint |

## การเชื่อมต่อ Backend
การเรียก API ใช้ `axios` ผ่าน helper `src/lib/api-client.ts` ซึ่งแนบ JWT จาก Cookie ให้โดยอัตโนมัติ ทุกครั้งที่ได้รับ 401 จะล้าง token และพาไปหน้า login โดย SweetAlert แจ้งผล

## การ build ผ่าน Docker (ตัวอย่าง)
ภายในโฟลเดอร์ `frontend`
```bash
docker build -t finderhub-frontend .
docker run --rm -p 3000:3000 --env-file .env.local finderhub-frontend
```
> Dockerfile ตั้งค่าให้รัน `npm run dev` หากต้องการ production ให้ปรับสคริปต์ CMD ตามเหมาะสม

## ทิปส์การปรับแต่ง
- สามารถเพิ่มเมนูใน sidebar ได้ที่ `src/components/back-sidebar.tsx`
- ปรับรูปแบบตารางผู้ใช้ได้ที่ `src/components/admin/users-table.tsx`
- หากต้องการเพิ่มหน้าใหม่ในแดชบอร์ด ให้สร้างไฟล์ใต้ `src/app/admin/` และ breadcrumb จะอัปเดตอัตโนมัติจาก path
