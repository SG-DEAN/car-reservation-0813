"use client"

import { CardDescription } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, MapPin, RefreshCw, Plus } from "lucide-react"
import { useReservationStore } from "@/services/reservation-service"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { WeekendCalendar } from "@/components/weekend-calendar"

export default function CarnivalWeekendPage() {
  const { weekendRequests, isLoading, syncReservations } = useReservationStore()
  const { user } = useAuth()
  const [showMyRequests, setShowMyRequests] = useState(false)

  useEffect(() => {
    syncReservations()
  }, [syncReservations])

  const handleRefresh = () => {
    syncReservations()
  }

  // 사용자의 주말 요청만 필터링 - weekendRequests가 undefined일 경우를 대비해 빈 배열로 기본값 설정
  const userRequests = (weekendRequests || []).filter((request) => request.userId === user?.id)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">승인 대기</Badge>
      case "approved":
        return <Badge variant="default">승인됨</Badge>
      case "rejected":
        return <Badge variant="destructive">거절됨</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">카니발 주말 사용</h1>
          <p className="text-gray-600">주말 및 공휴일 카니발 차량 예약을 관리합니다.</p>
        </div>

        <WeekendCalendar />

        {/* 주말 사용 일정과 내 신청 내역 */}
        <div className="grid gap-6 md:grid-cols-3 mt-8">
          <div className="md:col-span-2">{/* 달력 예약 컴포넌트는 이미 TabsContent에 포함되어 있으므로 제거 */}</div>

          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>내 신청 내역</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMyRequests(!showMyRequests)}
                    className="flex items-center gap-1"
                  >
                    <Plus className={`h-4 w-4 transition-transform ${showMyRequests ? "rotate-45" : ""}`} />
                    {showMyRequests ? "접기" : "펼치기"}
                  </Button>
                </div>
                <CardDescription>주말 차량 사용 신청 현황을 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="ml-2">데이터를 불러오는 중...</span>
                  </div>
                ) : userRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">아직 신청한 내역이 없습니다.</p>
                    <Button asChild className="mt-4" size="sm">
                      <Link href="/carnival-weekend/new">첫 신청하기</Link>
                    </Button>
                  </div>
                ) : showMyRequests ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {userRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {new Date(request.startDate).toLocaleDateString("ko-KR")} -{" "}
                              {new Date(request.endDate).toLocaleDateString("ko-KR")}
                            </span>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{request.destination}</span>
                          </div>
                        </div>

                        {request.adminNote && (
                          <div className="text-xs bg-muted p-2 rounded">
                            <strong>관리자 메모:</strong> {request.adminNote}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>신청일: {new Date(request.createdAt).toLocaleDateString("ko-KR")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">{userRequests.length}개의 신청 내역</p>
                    <p className="text-xs text-muted-foreground mt-1">펼치기를 클릭하여 확인하세요</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
