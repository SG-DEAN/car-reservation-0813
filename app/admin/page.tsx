"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Users, History, Car } from "lucide-react"

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  // 관리자가 아니면 홈으로 리다이렉트
  useEffect(() => {
    // 로딩이 완료된 후에만 권한 체크
    if (!isLoading) {
      if (!user || user.role !== "admin") {
        router.push("/")
      } else {
        setIsAuthorized(true)
      }
    }
  }, [user, router, isLoading])

  // 로딩 중이거나 권한이 없으면 로딩 표시
  if (isLoading || !isAuthorized) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            {isLoading ? <p>로딩 중...</p> : <p>권한이 없습니다. 관리자 계정으로 로그인해주세요.</p>}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">관리자 페이지</h1>
            <p className="text-gray-500 mt-1">차량 예약 시스템 관리</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Link href="/admin/users">
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>사용자 관리</CardTitle>
                    <Users className="h-5 w-5 text-gray-500" />
                  </div>
                  <CardDescription>사용자 계정 생성 및 관리</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">새로운 사용자 계정을 생성하고 기존 계정을 관리할 수 있습니다.</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/history">
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>이용 내역</CardTitle>
                    <History className="h-5 w-5 text-gray-500" />
                  </div>
                  <CardDescription>차량 이용 내역 조회</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">모든 차량 예약 및 이용 내역을 조회하고 관리할 수 있습니다.</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/cars">
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>차량 관리</CardTitle>
                    <Car className="h-5 w-5 text-gray-500" />
                  </div>
                  <CardDescription>차량 정보 관리</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    차량 정보를 추가, 수정, 삭제하고 차량 상태를 관리할 수 있습니다.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row">
          <p className="text-sm text-gray-500">© 2023 SG 법인차량 예약 서비스. 모든 권리 보유.</p>
        </div>
      </footer>
    </div>
  )
}
