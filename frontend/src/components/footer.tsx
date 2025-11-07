import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-auto w-full">
            <div className="bg-[#1F365C] px-6 py-8 text-center text-white">
                <p className="text-sm font-semibold">Copyright FinderHub 2025</p>
                <p className="mt-1 text-xs md:text-sm">
                    ติดต่อเรา dev@finderhub.th 02-000-0000 | <Link href="/admin" className="underline">สำหรับผู้ดูแลเท่านั้น</Link>
                </p>
            </div>
        </footer>
    );
}