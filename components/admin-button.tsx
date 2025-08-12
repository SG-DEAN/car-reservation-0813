"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { ShieldAlert } from "lucide-react"

export function AdminButton() {
  const { user } = useAuth()

  // 관리자가 아니면 버튼을 표시하지 않음
  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <Link href="/admin" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
      <ShieldAlert className="h-4 w-4" />
      관리자 페이지
    </Link>
  )
}
