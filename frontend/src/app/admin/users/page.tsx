import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersPanel } from '@/components/admin/users-panel';

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">แดชบอร์ดผู้ดูแล</h1>
        <p className="text-muted-foreground">ดูแลและจัดการผู้ใช้งานของระบบ FinderHub</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการผู้ใช้งาน</CardTitle>
          <CardDescription>ผู้ใช้งานทั้งหมดที่ลงทะเบียนภายในระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersPanel />
        </CardContent>
      </Card>
    </div>
  );
}
