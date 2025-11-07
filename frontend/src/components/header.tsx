"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, Search, X } from "lucide-react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen((prev) => !prev);

  return (
    <header className="border-b border-[#DFE5EE] bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-6">
        <div className="shrink-0">
          <Image
            src="/FinderHub.svg"
            alt="FinderHub logo"
            width={190}
            height={52}
            priority
          />
        </div>

        <button
          type="button"
          onClick={toggleMobile}
          className="flex items-center gap-2 rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#0F2942] transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC] focus:outline-none md:hidden"
          aria-label={mobileOpen ? "ปิดเมนู" : "เปิดเมนู"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          เมนู
        </button>

        <div className="hidden flex-1 flex-wrap items-center justify-end gap-4 md:flex">
          <div className="relative flex min-w-[280px] flex-1 items-center rounded-full bg-[#F4F7FB] shadow-[0_10px_24px_rgba(15,41,66,0.08)]">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-5 h-5 w-5 text-[#98A2B3]"
            />
            <input
              type="text"
              placeholder='ค้นหาด้วย "ประเภท", "ชื่อ", "สถานที่", ...'
              className="w-full rounded-full bg-transparent py-3 pl-12 pr-5 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="whitespace-nowrap rounded-full bg-[#E51937] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d01732]"
          >
            พบทรัพย์สินไม่มีเจ้าของ ?
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#E5E7EB] bg-white/95 px-6 pb-6 pt-4 shadow-[0_20px_40px_rgba(15,41,66,0.08)] md:hidden">
          <div className="flex flex-col gap-4">
            <div className="relative flex items-center rounded-full bg-[#F4F7FB]">
              <Search aria-hidden className="pointer-events-none absolute left-5 h-5 w-5 text-[#98A2B3]" />
              <input
                type="text"
                placeholder='ค้นหาด้วย "ประเภท", "ชื่อ", "สถานที่", ...'
                className="w-full rounded-full bg-transparent py-3 pl-12 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
              />
            </div>
            <button
              type="button"
              className="rounded-full bg-[#E51937] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d01732]"
            >
              พบทรัพย์สินไม่มีเจ้าของ ?
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
