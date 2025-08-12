"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ChevronLeft, Search, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// 이용 내역 타입 정의
interface ReservationHistory {
  id: string
  carId: string
  carName: string
  userId: string
  userName: string
  userDepartment: string
  startTime: string
  endTime: string
  createdAt: string
  status: "completed" | "cancelled" | "modified" | "active"
  purpose?: string
  destination?: string
  modifiedAt?: string
  modifiedBy?: string
  cancelledAt?: string
  cancelledBy?: string
}

export default function HistoryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [history, setHistory] = useState<ReservationHistory[]>([])
  const [filteredHistory, setFilteredHistory] = useState<ReservationHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedHistory, setSelectedHistory] = useState<ReservationHistory | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [filters, setFilters] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    userName: "",
    carName: "",
    status: "all",
  })

  // 관리자가 아니면 홈으로 리다이렉트
  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/")
      return
    }

    // 실제 구현에서는 API에서 이용 내역을 가져옴
    // 여기서는 샘플 데이터 사용
    const sampleHistory: ReservationHistory[] = [
      {
        id: "H1",
        carId: "1",
        carName: "카니발 (223허 9561)",
        userId: "2",
        userName: "홍길동",
        userDepartment: "영업부",
        startTime: "2025-04-05T09:00:00",
        endTime: "2025-04-05T13:00:00",
        createdAt: "2025-04-01T10:15:00",
        status: "completed",
        purpose: "거래처 미팅",
        destination: "강남구 테헤란로",
      },
      {
        id: "H2",
        carId: "2",
        carName: "아이오닉 (49호 8181)",
        userId: "3",
        userName: "김철수",
        userDepartment: "개발부",
        startTime: "2025-04-06T10:30:00",
        endTime: "2025-04-06T14:30:00",
        createdAt: "2025-04-02T11:20:00",
        status: "modified",
        purpose: "외부 교육 참석",
        destination: "서초구 교육센터",
        modifiedAt: "2025-04-03T09:45:00",
        modifiedBy: "김철수",
      },
      {
        id: "H3",
        carId: "3",
        carName: "아이오닉 (31호 7136)",
        userId: "2",
        userName: "홍길동",
        userDepartment: "영업부",
        startTime: "2025-04-07T09:00:00",
        endTime: "2025-04-07T11:30:00",
        createdAt: "2025-04-03T14:30:00",
        status: "cancelled",
        purpose: "고객사 방문",
        destination: "송파구 올림픽로",
        cancelledAt: "2025-04-04T16:20:00",
        cancelledBy: "홍길동",
      },
      {
        id: "H4",
        carId: "4",
        carName: "스포티지 (223하 7447)",
        userId: "3",
        userName: "김철수",
        userDepartment: "개발부",
        startTime: "2025-04-08T13:00:00",
        endTime: "2025-04-08T17:00:00",
        createdAt: "2025-04-04T10:10:00",
        status: "completed",
        purpose: "자재 수령",
        destination: "경기도 성남시",
      },
      {
        id: "H5",
        carId: "5",
        carName: "레이 (34나 8200)",
        userId: "2",
        userName: "홍길동",
        userDepartment: "영업부",
        startTime: "2025-04-09T09:00:00",
        endTime: "2025-04-09T12:00:00",
        createdAt: "2025-04-05T11:45:00",
        status: "active",
        purpose: "서류 전달",
        destination: "마포구 상암동",
      },
    ]

    setHistory(sampleHistory)
    setFilteredHistory(sampleHistory)
    setTotalPages(Math.ceil(sampleHistory.length / 10))
    setIsLoading(false)
  }, [user, router])

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearch = () => {
    // 필터링 로직 구현
    setIsLoading(true)

    let filtered = [...history]

    // 사용자 이름으로 필터링
    if (filters.userName) {
      filtered = filtered.filter((item) => item.userName.toLowerCase().includes(filters.userName.toLowerCase()))
    }

    // 차량 이름으로 필터링
    if (filters.carName) {
      filtered = filtered.filter((item) => item.carName.toLowerCase().includes(filters.carName.toLowerCase()))
    }

    // 상태로 필터링
    if (filters.status !== "all") {
      filtered = filtered.filter((item) => item.status === filters.status)
    }

    // 날짜 범위로 필터링
    if (filters.startDate) {
      filtered = filtered.filter((item) => new Date(item.startTime) >= filters.startDate!)
    }

    if (filters.endDate) {
      filtered = filtered.filter((item) => new Date(item.startTime) <= filters.endDate!)
    }

    setFilteredHistory(filtered)
    setTotalPages(Math.ceil(filtered.length / 10))
    setPage(1)

    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  const handleExport = () => {
    // 실제 구현에서는 CSV 파일로 내보내기
    alert("이용 내역이 CSV 파일로 내보내기 되었습니다.")
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "yyyy-MM-dd HH:mm", { locale: ko })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">완료</Badge>
      case "cancelled":
        return <Badge variant="destructive">취소</Badge>
      case "modified":
        return <Badge variant="secondary">수정</Badge>
      case "active":
        return <Badge className="bg-green-500">진행중</Badge>
      default:
        return null
    }
  }

  const handleViewDetails = (item: ReservationHistory) => {
    setSelectedHistory(item)
    setIsDetailOpen(true)
  }

  // 페이지당 항목 수
  const itemsPerPage = 10
  const paginatedHistory = filteredHistory.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="mb-6">
            <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
              <ChevronLeft className="mr-1 h-4 w-4" />
              관리자 페이지로 돌아가기
            </Link>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">차량 이용 내역</h1>
            <Button onClick={handleExport} className="gap-1">
              <FileDown className="h-4 w-4" /> CSV 내보내기
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>필터</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2">
                  <Label>시작 날짜</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : "날짜 선택"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.startDate}
                        onSelect={(date) => handleFilterChange("startDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>종료 날짜</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : "날짜 선택"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.endDate}
                        onSelect={(date) => handleFilterChange("endDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>사용자</Label>
                  <Input
                    placeholder="사용자 이름"
                    value={filters.userName}
                    onChange={(e) => handleFilterChange("userName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>차량</Label>
                  <Input
                    placeholder="차량 이름"
                    value={filters.carName}
                    onChange={(e) => handleFilterChange("carName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>상태</Label>
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모두</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                      <SelectItem value="cancelled">취소</SelectItem>
                      <SelectItem value="modified">수정</SelectItem>
                      <SelectItem value="active">진행중</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleSearch} className="gap-1">
                  <Search className="h-4 w-4" /> 검색
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>이용 내역 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">로딩 중...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>예약 ID</TableHead>
                        <TableHead>차량</TableHead>
                        <TableHead>사용자</TableHead>
                        <TableHead>부서</TableHead>
                        <TableHead>시작 시간</TableHead>
                        <TableHead>종료 시간</TableHead>
                        <TableHead>생성 시간</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>상세</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedHistory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-4">
                            검색 결과가 없습니다
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedHistory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.id}</TableCell>
                            <TableCell>{item.carName}</TableCell>
                            <TableCell>{item.userName}</TableCell>
                            <TableCell>{item.userDepartment}</TableCell>
                            <TableCell>{formatDateTime(item.startTime)}</TableCell>
                            <TableCell>{formatDateTime(item.endTime)}</TableCell>
                            <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => handleViewDetails(item)}>
                                상세보기
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (page > 1) setPage(page - 1)
                            }}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <PaginationItem key={i + 1}>
                            <PaginationLink
                              href="#"
                              isActive={page === i + 1}
                              onClick={(e) => {
                                e.preventDefault()
                                setPage(i + 1)
                              }}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (page < totalPages) setPage(page + 1)
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 상세 정보 다이얼로그 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>예약 상세 정보</DialogTitle>
            <DialogDescription>예약 ID: {selectedHistory?.id}</DialogDescription>
          </DialogHeader>
          {selectedHistory && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">차량</p>
                  <p>{selectedHistory.carName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">사용자</p>
                  <p>
                    {selectedHistory.userName} ({selectedHistory.userDepartment})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">시작 시간</p>
                  <p>{formatDateTime(selectedHistory.startTime)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">종료 시간</p>
                  <p>{formatDateTime(selectedHistory.endTime)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">이용 목적</p>
                <p>{selectedHistory.purpose || "미기재"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">방문지</p>
                <p>{selectedHistory.destination || "미기재"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">상태</p>
                <div className="mt-1">{getStatusBadge(selectedHistory.status)}</div>
              </div>

              {selectedHistory.status === "modified" && selectedHistory.modifiedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-500">수정 정보</p>
                  <p className="text-sm">
                    {selectedHistory.modifiedBy}님이 {formatDateTime(selectedHistory.modifiedAt)}에 수정함
                  </p>
                </div>
              )}

              {selectedHistory.status === "cancelled" && selectedHistory.cancelledAt && (
                <div>
                  <p className="text-sm font-medium text-gray-500">취소 정보</p>
                  <p className="text-sm">
                    {selectedHistory.cancelledBy}님이 {formatDateTime(selectedHistory.cancelledAt)}에 취소함
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row">
          <p className="text-sm text-gray-500">© 2023 SG 법인차량 예약 서비스. 모든 권리 보유.</p>
        </div>
      </footer>
    </div>
  )
}
