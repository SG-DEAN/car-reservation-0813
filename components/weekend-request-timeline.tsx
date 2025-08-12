"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, CalendarIcon } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

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

interface WeekendRequestTimelineProps {
  requests: WeekendRequest[]
}

export function WeekendRequestTimeline({ requests }: WeekendRequestTimelineProps) {
  const [viewMode, setViewMode] = useState<"all" | "pending" | "approved" | "rejected">("all")

  // 상태별로 필터링
  const filteredRequests = viewMode === "all" ? requests : requests.filter((req) => req.status === viewMode)

  // 날짜 포맷 함수 - 오류 방지를 위한 안전한 포맷팅
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy년 MM월 dd일 HH:mm", { locale: ko })
    } catch (error) {
      return dateString
    }
  }

  // 상태에 따른 아이콘 및 색상
  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-6 w-6 text-yellow-500" />
      case "approved":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />
      case "rejected":
        return <XCircle className="h-6 w-6 text-red-500" />
    }
  }

  // 상태에 따른 텍스트
  const getStatusText = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return "승인 대기 중"
      case "approved":
        return "승인됨"
      case "rejected":
        return "거부됨"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>주말 사용 신청 타임라인</CardTitle>
          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "all" | "pending" | "approved" | "rejected")}
          >
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="pending">대기</TabsTrigger>
              <TabsTrigger value="approved">승인</TabsTrigger>
              <TabsTrigger value="rejected">거부</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">해당하는 신청 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="relative">
            {filteredRequests.map((request, index) => (
              <div key={request.id} className="mb-8 last:mb-0">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">{getStatusIcon(request.status)}</div>
                  <div className="flex-grow">
                    <Link href={`/carnival-weekend/${request.id}`}>
                      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{request.userName}님의 주말 사용 신청</h3>
                          <Badge
                            variant="outline"
                            className={
                              request.status === "pending"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : request.status === "approved"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {getStatusText(request.status)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <span>사용 일시: {formatDate(request.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>신청 일시: {formatDate(request.createdAt)}</span>
                          </div>
                        </div>
                        <p className="text-sm">{request.purpose}</p>

                        {/* 특이사항 및 계기판 사진 표시 */}
                        {request.status === "approved" && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            {request.notes && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-gray-600">특이사항:</p>
                                <p className="text-xs text-gray-600">{request.notes}</p>
                              </div>
                            )}

                            {request.odometerBefore && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-gray-600">주행거리:</p>
                                <p className="text-xs text-gray-600">
                                  사용 전: {request.odometerBefore} km
                                  {request.odometerAfter && ` / 사용 후: ${request.odometerAfter} km`}
                                </p>
                              </div>
                            )}

                            {/* 계기판 사진 (샘플) */}
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">사용 전 계기판:</p>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <div className="cursor-pointer border rounded-md overflow-hidden h-16 bg-gray-100 flex items-center justify-center">
                                      <div className="relative w-full h-full">
                                        <div
                                          className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                                          style={{
                                            backgroundImage: "url(https://i.ibb.co/Qp1NKwM/odometer-sample.jpg)",
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-md">
                                    <div className="aspect-video relative overflow-hidden rounded-lg">
                                      <div
                                        className="w-full h-full bg-center bg-contain bg-no-repeat"
                                        style={{ backgroundImage: "url(https://i.ibb.co/Qp1NKwM/odometer-sample.jpg)" }}
                                      />
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>

                              {request.odometerAfter && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-1">사용 후 계기판:</p>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <div className="cursor-pointer border rounded-md overflow-hidden h-16 bg-gray-100 flex items-center justify-center">
                                        <div className="relative w-full h-full">
                                          <div
                                            className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                                            style={{
                                              backgroundImage: "url(https://i.ibb.co/Qp1NKwM/odometer-sample.jpg)",
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                      <div className="aspect-video relative overflow-hidden rounded-lg">
                                        <div
                                          className="w-full h-full bg-center bg-contain bg-no-repeat"
                                          style={{
                                            backgroundImage: "url(https://i.ibb.co/Qp1NKwM/odometer-sample.jpg)",
                                          }}
                                        />
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {request.status === "approved" && request.approvedAt && (
                          <div className="mt-2 text-xs text-green-600">
                            {request.approvedBy}님이 {formatDate(request.approvedAt)}에 승인함
                          </div>
                        )}
                        {request.status === "rejected" && request.rejectedAt && (
                          <div className="mt-2 text-xs text-red-600">
                            {request.rejectedBy}님이 {formatDate(request.rejectedAt)}에 거부함
                            {request.rejectedReason && <div className="mt-1">사유: {request.rejectedReason}</div>}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                </div>
                {index < filteredRequests.length - 1 && (
                  <div className="absolute left-3 top-6 w-px bg-gray-200" style={{ height: "calc(100% - 2rem)" }}></div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
