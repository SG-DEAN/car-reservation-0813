"use client"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { UserNav } from "@/components/user-nav"

export function MobileHeader() {
  const { user } = useAuth()

  return (
    <header className="w-full border-b bg-white">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-10 w-32">
            <Image
              src="https://i.ibb.co/7tj0SX2/surplus-global-logo.png"
              alt="서플러스글로벌 로고"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold">법인차량 예약</span>
        </Link>

        {/* 우측에 UserNav 추가 */}
        <div className="ml-auto">
          <UserNav />
        </div>
      </div>

      <div className="container overflow-x-auto">
        <nav className="flex items-center gap-4 py-2 px-4 whitespace-nowrap">
          <Link className="text-sm font-medium hover:underline" href="/">
            홈
          </Link>
          <Link className="text-sm font-medium hover:underline" href="/guide">
            이용 가이드
          </Link>
          {user && (
            <Link className="text-sm font-medium hover:underline" href="/reservations">
              내 예약
            </Link>
          )}
          <Link className="text-sm font-medium hover:underline" href="/carnival-weekend">
            카니발 주말 사용
          </Link>
          {user && user.role === "admin" && (
            <Link className="text-sm font-medium hover:underline" href="/admin">
              관리자 페이지
            </Link>
          )}
          {user && (
            <Link className="text-sm font-medium hover:underline" href="/settings">
              설정
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
