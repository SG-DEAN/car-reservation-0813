"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ChevronLeft, Plus, FileText, Clock, User, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

// 주말 사용 신청 상태 타입
type RequestStatus = "pending" | "approved" | "rejected"

// 주말 사용 신청 타입
interface WeekendRequest {
  id: string
  userId: string
  userName: string
  userDepartment: string
  startDate: string
  endDate: string
  purpose: string
  status: RequestStatus
  createdAt: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  rejectedReason?: string
  odometerBefore?: string
  odometerAfter?: string
  notes?: string
}

export default function WeekendRequestListPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"my-requests" | "all-requests">("my-requests")

  // 샘플 주말 사용 신청 데이터
  const weekendRequests: WeekendRequest[] = [
    {
      id: "w1",
      userId: "2",
      userName: "홍길동",
      userDepartment: "영업부",
      startDate: "2025-04-13T09:00:00", // 주말
      endDate: "2025-04-13T18:00:00",
      purpose: "가족 행사 참석",
      status: "approved",
      createdAt: "2025-04-08T10:15:00",
      approvedAt: "2025-04-09T11:30:00",
      approvedBy: "관리자",
      odometerBefore: "12345",
      notes: "특이사항 없음",
    },
    {
      id: "w2",
      userId: "3",
      userName: "김철수",
      userDepartment: "개발부",
      startDate: "2025-04-20T10:00:00", // 주말
      endDate: "2025-04-20T16:00:00",
      purpose: "개인 용무",
      status: "pending",
      createdAt: "2025-04-10T14:20:00",
    },
    {
      id: "w3",
      userId: "2",
      userName: "홍길동",
      userDepartment: "영업부",
      startDate: "2025-04-27T08:00:00", // 주말
      endDate: "2025-04-27T17:00:00",
      purpose: "이사",
      status: "rejected",
      createdAt: "2025-04-12T09:45:00",
      rejectedAt: "2025-04-13T10:30:00",
      rejectedBy: "관리자",
      rejectedReason: "해당 날짜에 이미 다른 예약이 있습니다.",
    },
  ]

  // 현재 사용자의 신청만 필터링
  const myRequests = user ? weekendRequests.filter((req) => req.userId === user.id) : []

  // 날짜 포맷 함수 - 오류 방지를 위한 안전한 포맷팅
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy년 MM월 dd일 (EEE) HH:mm", { locale: ko })
    } catch (error) {
      return dateString
    }
  }

  // 상태에 따른 배지 색상 및 텍스트
  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            승인 대기
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            승인됨
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            거부됨
          </Badge>
        )
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="mb-6">
            <Link
              href="/carnival-weekend"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              카니발 주말 사용으로 돌아가기
            </Link>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">주말 사용 신청 내역</h1>
            <Link href="/carnival-weekend/new">
              <Button className="gap-1">
                <Plus className="h-4 w-4" /> 주말 사용 신청
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>신청 내역</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "my-requests" | "all-requests")}>
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="my-requests">내 신청</TabsTrigger>
                    <TabsTrigger value="all-requests">전체 신청</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="my-requests">
                  {myRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">신청 내역이 없습니다</h3>
                      <p className="text-gray-500 mb-4">카니발 차량의 주말 사용 신청 내역이 없습니다.</p>
                      <Link href="/carnival-weekend/new">
                        <Button>주말 사용 신청하기</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myRequests.map((request) => (
                        <Link key={request.id} href={`/carnival-weekend/${request.id}`}>
                          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">카니발 (223허 9561)</span>
                              </div>
                              {getStatusBadge(request.status)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span>{formatDate(request.startDate)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-gray-500" />
                                <span>
                                  {request.userName} ({request.userDepartment})
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="all-requests">
                  <div className="space-y-4">
                    {weekendRequests.map((request) => (
                      <Link key={request.id} href={`/carnival-weekend/${request.id}`}>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">카니발 (223허 9561)</span>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{formatDate(request.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>
                                {request.userName} ({request.userDepartment})
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row">
          <p className="text-sm text-gray-500">© 2023 SG 법인차량 예약 서비스. 모든 권리 보유.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline" href="#">
              서비스 이용약관
            </Link>
            <Link className="text-sm font-medium hover:underline" href="#">
              개인정보 처리방침
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
