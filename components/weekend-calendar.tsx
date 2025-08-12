"use client"

import type React from "react"

import { useState } from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns"
import { ko } from "date-fns/locale"
import { ChevronLeft, ChevronRight, CalendarIcon, Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// 예약 ���입 정의
interface WeekendReservation {
  id: string
  userId: string
  userName: string
  userDepartment: string
  date: string
  purpose: string
  destination: string
  passengers: number
  phoneNumber: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

// 샘플 예약 데이터
const sampleReservations: WeekendReservation[] = [
  {
    id: "1",
    userId: "2",
    userName: "홍길동",
    userDepartment: "영업부",
    date: "2024-01-13",
    purpose: "가족 여행",
    destination: "부산",
    passengers: 4,
    phoneNumber: "010-1234-5678",
    status: "approved",
    createdAt: "2024-01-10T09:00:00Z",
  },
  {
    id: "2",
    userId: "3",
    userName: "김철수",
    userDepartment: "개발부",
    date: "2024-01-20",
    purpose: "친구 모임",
    destination: "강릉",
    passengers: 3,
    phoneNumber: "010-2345-6789",
    status: "pending",
    createdAt: "2024-01-15T14:30:00Z",
  },
]

export function WeekendCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [reservations, setReservations] = useState<WeekendReservation[]>(sampleReservations)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<WeekendReservation | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    purpose: "",
    destination: "",
    passengers: 1,
    phoneNumber: "",
  })

  // 달력 생성
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const dateFormat = "d"
  const rows = []
  let days = []
  let day = startDate

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day
      const formattedDate = format(day, dateFormat)
      const isCurrentMonth = isSameMonth(day, monthStart)
      const isSelected = selectedDate && isSameDay(day, selectedDate)
      const isTodayDate = isToday(day)

      // 주말 여부 확인 (토요일: 6, 일요일: 0)
      const dayOfWeek = day.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      // 해당 날짜의 예약 확인
      const dayReservations = reservations.filter((reservation) => isSameDay(parseISO(reservation.date), day))

      // 예약 불가능한 날짜 판별 (지난 날짜 또는 예약이 있는 날짜)
      const isPastDate = day < new Date(new Date().setHours(0, 0, 0, 0))
      const hasReservation = dayReservations.length > 0
      const isUnavailableDate = isPastDate || hasReservation

      // 요일별 색상 설정
      const getDayTextColor = () => {
        if (!isCurrentMonth) return "text-gray-300"
        if (dayOfWeek === 0) return "text-red-600 font-bold" // 일요일
        if (dayOfWeek === 6) return "text-blue-600 font-bold" // 토요일
        return "text-gray-900"
      }

      days.push(
        <div
          key={day.toString()}
          className={`
            min-h-[80px] p-2 border border-gray-200 cursor-pointer transition-colors relative
            ${!isCurrentMonth ? "bg-gray-50" : "bg-white"}
            ${isSelected ? "bg-blue-100 border-blue-300" : ""}
            ${isTodayDate ? "bg-yellow-50 border-yellow-300" : ""}
            ${isUnavailableDate ? "bg-gray-100 opacity-60" : "hover:bg-gray-50"}
            ${!isWeekend && isCurrentMonth && !isUnavailableDate ? "hover:bg-blue-50" : ""}
          `}
          onClick={() => {
            if (isCurrentMonth && !isUnavailableDate) {
              setSelectedDate(cloneDay)
              if (isWeekend) {
                setIsDialogOpen(true)
              }
            }
          }}
        >
          <span className={`text-sm ${getDayTextColor()}`}>{formattedDate}</span>

          {/* 예약 표시 */}
          {dayReservations.map((reservation, index) => (
            <div
              key={reservation.id}
              className={`
                mt-1 px-2 py-1 rounded text-xs text-white cursor-pointer
                ${
                  reservation.status === "approved"
                    ? "bg-green-500"
                    : reservation.status === "pending"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }
              `}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedReservation(reservation)
                setFormData({
                  purpose: reservation.purpose,
                  destination: reservation.destination,
                  passengers: reservation.passengers,
                  phoneNumber: reservation.phoneNumber,
                })
                setIsEditDialogOpen(true)
              }}
            >
              <div className="truncate font-medium">{reservation.userName}</div>
              <div className="truncate text-xs opacity-90">{reservation.purpose}</div>
            </div>
          ))}

          {/* 예약 가능 표시 (주말이고 예약이 없는 경우) */}
          {isWeekend && isCurrentMonth && !isUnavailableDate && dayReservations.length === 0 && (
            <div className="absolute bottom-1 right-1">
              <Plus className="h-4 w-4 text-blue-500 opacity-60" />
            </div>
          )}
        </div>,
      )
      day = addDays(day, 1)
    }
    rows.push(
      <div key={day.toString()} className="grid grid-cols-7">
        {days}
      </div>,
    )
    days = []
  }

  // 이전 달로 이동
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  // 다음 달로 이동
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // 폼 입력 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // 승객 수 변경 핸들러
  const handlePassengersChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      passengers: Number.parseInt(value),
    }))
  }

  // 예약 제출 핸들러
  const handleSubmitReservation = () => {
    if (!user || !selectedDate) return

    if (!formData.purpose.trim() || !formData.destination.trim() || !formData.phoneNumber.trim()) {
      toast({
        title: "입력 오류",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    const newReservation: WeekendReservation = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userDepartment: user.department,
      date: selectedDate.toISOString().split("T")[0],
      purpose: formData.purpose,
      destination: formData.destination,
      passengers: formData.passengers,
      phoneNumber: formData.phoneNumber,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    setReservations((prev) => [...prev, newReservation])
    setIsDialogOpen(false)
    setSelectedDate(null)
    setFormData({
      purpose: "",
      destination: "",
      passengers: 1,
      phoneNumber: "",
    })

    toast({
      title: "예약 신청 완료",
      description: "카니발 주말 사용 신청이 완료되었습니다. 승인을 기다려주세요.",
    })
  }

  // 예약 수정 핸들러
  const handleUpdateReservation = () => {
    if (!selectedReservation) return

    if (!formData.purpose.trim() || !formData.destination.trim() || !formData.phoneNumber.trim()) {
      toast({
        title: "입력 오류",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === selectedReservation.id
          ? {
              ...reservation,
              purpose: formData.purpose,
              destination: formData.destination,
              passengers: formData.passengers,
              phoneNumber: formData.phoneNumber,
            }
          : reservation,
      ),
    )

    setIsEditDialogOpen(false)
    setSelectedReservation(null)
    setFormData({
      purpose: "",
      destination: "",
      passengers: 1,
      phoneNumber: "",
    })

    toast({
      title: "예약 수정 완료",
      description: "예약 정보가 성공적으로 수정되었습니다.",
    })
  }

  // 예약 삭제 핸들러
  const handleDeleteReservation = () => {
    if (!selectedReservation) return

    setReservations((prev) => prev.filter((reservation) => reservation.id !== selectedReservation.id))
    setIsDeleteAlertOpen(false)
    setIsEditDialogOpen(false)
    setSelectedReservation(null)

    toast({
      title: "예약 삭제 완료",
      description: "예약이 성공적으로 삭제되었습니다.",
    })
  }

  // 상태별 배지 색상
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // 상태별 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "승인됨"
      case "pending":
        return "승인 대기"
      case "rejected":
        return "거절됨"
      default:
        return "알 수 없음"
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              카니발 주말 사용 신청
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold min-w-[120px] text-center">
                {format(currentDate, "yyyy년 MM월", { locale: ko })}
              </h2>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-2">
            {["월", "화", "수", "목", "금", "토", "일"].map((day, index) => (
              <div
                key={day}
                className={`p-2 text-center text-sm font-medium ${
                  index === 5 ? "text-blue-600" : index === 6 ? "text-red-600" : "text-gray-700"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 */}
          <div className="space-y-0">{rows}</div>

          {/* 범례 */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>승인됨</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>승인 대기</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>거절됨</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-100 border rounded"></div>
              <span>예약 불가</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 예약 신청 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>카니발 주말 사용 신청</DialogTitle>
            <DialogDescription>
              {selectedDate && format(selectedDate, "yyyy년 MM월 dd일 (E)", { locale: ko })} 카니발 사용을 신청합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">사용 목적 *</Label>
              <Input
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                placeholder="예: 가족 여행, 친구 모임 등"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">목적지 *</Label>
              <Input
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="예: 부산, 강릉, 제주도 등"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passengers">탑승 인원</Label>
              <Select value={formData.passengers.toString()} onValueChange={handlePassengersChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}명
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">연락처 *</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="010-0000-0000"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSubmitReservation}>신청하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 예약 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>예약 정보 수정</DialogTitle>
            <DialogDescription>
              {selectedReservation && (
                <>
                  {format(parseISO(selectedReservation.date), "yyyy년 MM월 dd일 (E)", { locale: ko })} 예약 정보를
                  수정합니다.
                  <div className="mt-2">
                    <Badge className={getStatusBadgeColor(selectedReservation.status)}>
                      {getStatusText(selectedReservation.status)}
                    </Badge>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editPurpose">사용 목적 *</Label>
              <Input
                id="editPurpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                placeholder="예: 가족 여행, 친구 모임 등"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDestination">목적지 *</Label>
              <Input
                id="editDestination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="예: 부산, 강릉, 제주도 등"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPassengers">탑승 인원</Label>
              <Select value={formData.passengers.toString()} onValueChange={handlePassengersChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}명
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPhoneNumber">연락처 *</Label>
              <Input
                id="editPhoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="010-0000-0000"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>예약을 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 작업은 되돌릴 수 없습니다. 예약이 영구적으로 삭제됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteReservation}>삭제</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleUpdateReservation}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
