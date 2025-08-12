"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { format, addDays, subDays, isSameDay, parseISO } from "date-fns"
import { ko } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { LoginDialog } from "@/components/login-dialog"
import { useReservationStore, type Reservation } from "@/services/reservation-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useRef } from "react";

// 차량 타입 정의
interface Car {
  id: string
  name: string
  image: string
  type: string
  color: string
  seats: string
  location: string
}

// 사용자 타입 정의
interface User {
  id: string
  name: string
  department: string
  team: string
}

export function MobileTimelineView() {
  const scrollDivRef = useRef<HTMLDivElement | null>(null);
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const div = scrollDivRef.current;
    if (!div) return;
    div.dataset.startY = String(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const div = scrollDivRef.current;
    if (!div) return;
    const scrollTop = div.scrollTop;
    const scrollHeight = div.scrollHeight;
    const offsetHeight = div.offsetHeight;
    const startY = Number(div.dataset.startY || "0");
    const currentY = e.touches[0].clientY;
    if (scrollTop === 0 && currentY > startY) {
      e.preventDefault();
      e.stopPropagation();
    }
    // 최하단에서 위로 스와이프
    else if (scrollTop + offsetHeight >= scrollHeight && currentY < startY) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [weekDates, setWeekDates] = useState<Date[]>([])
  const [isMonthlyViewOpen, setIsMonthlyViewOpen] = useState(false)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null)
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null)
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const { reservations, addReservation, syncReservations, lastUpdate } = useReservationStore()
  const [forceUpdate, setForceUpdate] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 예약 폼 상태
  const [formData, setFormData] = useState({
    pickupDate: new Date(),
    returnDate: new Date(),
    purpose: "",
    destination: "",
    isDirect: false,
    directReason: "",
    passengers: [] as string[],
    isMaintenanceReservation: false,
    maintenanceType: "",
    customMaintenanceType: "",
  })

  // 샘플 사용자 데이터
  const sampleUsers: User[] = [
    { id: "1", name: "관리자", department: "관리부", team: "관리팀" },
    { id: "2", name: "홍길동", department: "영업부", team: "영업1팀" },
    { id: "3", name: "김철수", department: "개발부", team: "개발1팀" },
    { id: "4", name: "이영희", department: "영업부", team: "영업2팀" },
    { id: "5", name: "박지성", department: "개발부", team: "개발2팀" },
    { id: "6", name: "손흥민", department: "마케팅부", team: "마케팅팀" },
    { id: "7", name: "김민재", department: "디자인부", team: "디자인팀" },
    { id: "8", name: "황희찬", department: "인사부", team: "인사팀" },
  ]

  // 동승자 검색 상태
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  // 검색어에 따라 사용자 필터링
  useEffect(() => {
    if (searchTerm.trim() === "") {
      const allAvailableUsers = sampleUsers.filter((u) => !formData.passengers.includes(u.id) && u.id !== user?.id)
      setFilteredUsers(allAvailableUsers)
      return
    }

    const searchTermLower = searchTerm.toLowerCase()
    const filtered = sampleUsers.filter(
      (u) =>
        (u.name.toLowerCase().includes(searchTermLower) ||
          u.team.toLowerCase().includes(searchTermLower) ||
          u.department.toLowerCase().includes(searchTermLower)) &&
        !formData.passengers.includes(u.id) &&
        u.id !== user?.id,
    )
    setFilteredUsers(filtered)
  }, [searchTerm, formData.passengers, user])

  // 샘플 차량 데이터
  const cars: Car[] = [
    {
      id: "1",
      name: "카니발 (223허 9561)",
      image: "https://i.ibb.co/QFt1WDwL/223-9561-removebg-preview.png",
      type: "SUV",
      color: "blue",
      seats: "7",
      location: "본사",
    },
    {
      id: "2",
      name: "아이오닉 (49호 8181)",
      image: "https://i.ibb.co/bMdkXZg3/31-7136-removebg-preview.png",
      type: "전기차",
      color: "green",
      seats: "5",
      location: "지점",
    },
    {
      id: "3",
      name: "아이오닉 (31호 7136)",
      image: "https://i.ibb.co/bMdkXZg3/31-7136-removebg-preview.png",
      type: "전기차",
      color: "teal",
      seats: "5",
      location: "본사",
    },
    {
      id: "4",
      name: "스포티지 (223하 7447)",
      image: "https://i.ibb.co/wrds2Lz5/223-7447-removebg-preview.png",
      type: "SUV",
      color: "purple",
      seats: "5",
      location: "지점",
    },
    {
      id: "5",
      name: "레이 (34나 8200)",
      image: "https://i.ibb.co/TDbzLyZk/34-8200-removebg-preview-1.png",
      type: "경차",
      color: "orange",
      seats: "4",
      location: "본사",
    },
    {
      id: "6",
      name: "그랜저 (191호 6774)",
      image: "https://i.ibb.co/LDQPwqF4/191-6774-removebg-preview.png",
      type: "세단",
      color: "red",
      seats: "5",
      location: "지점",
    },
    {
      id: "7",
      name: "그랜저 (191허 1381)",
      image: "https://i.ibb.co/LDQPwqF4/191-6774-removebg-preview.png",
      type: "세단",
      color: "pink",
      seats: "5",
      location: "본사",
    },
  ]

  // 시간 범위 생성 (8시부터 18시까지, 30분 단위)
  const timeSlots = []
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 18 && minute > 0) continue
      timeSlots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)
    }
  }

  // 15분 단위 시간 옵션 (예약 다이얼로그용)
  const timeOptions = []
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 18 && minute > 0) continue
      timeOptions.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)
    }
  }

  // 주간 날짜 계산
  useEffect(() => {
    const dates = []
    for (let i = -3; i <= 3; i++) {
      dates.push(addDays(selectedDate, i))
    }
    setWeekDates(dates)
  }, [selectedDate])

  // 강제 리렌더링 함수
  const triggerForceUpdate = useCallback(() => {
    setForceUpdate((prev) => prev + 1)
  }, [])

  // 이벤트 리스너 설정
  useEffect(() => {
    console.log("모바일: 이벤트 리스너 설정 시작")

    // 페이지 로드 시 데이터 동기화
    syncReservations()

    // 다른 탭/창에서 스토리지 변경 시 업데이트
    const handleStorageChange = (e: StorageEvent) => {
      console.log("모바일: 스토리지 변경 감지됨", e.key)
      if (e.key === "car-reservations" || e.key === "car-reservations-timestamp") {
        console.log("모바일: 예약 관련 스토리지 변경")
        setTimeout(() => {
          syncReservations()
          triggerForceUpdate()
        }, 100)
      }
    }

    // 같은 탭 내에서의 변경 감지를 위한 커스텀 이벤트 리스너
    const handleCustomStorageChange = (e: CustomEvent) => {
      console.log("모바일: 커스텀 스토리지 변경 감지됨", e.detail)
      setTimeout(() => {
        syncReservations()
        triggerForceUpdate()
      }, 50)
    }

    // 이벤트 버스 구독
    const unsubscribe = ReservationEventBus.subscribe(() => {
      console.log("모바일: 이벤트 버스 이벤트 감지됨")
      setTimeout(() => {
        syncReservations()
        triggerForceUpdate()
      }, 50)
    })

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("car-reservations-updated", handleCustomStorageChange as EventListener)

    return () => {
      console.log("모바일: 이벤트 리스너 정리")
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("car-reservations-updated", handleCustomStorageChange as EventListener)
      unsubscribe()
    }
  }, [syncReservations, triggerForceUpdate])

  // lastUpdate 변경 감지
  useEffect(() => {
    console.log("모바일: lastUpdate 변경됨", lastUpdate)
    triggerForceUpdate()
  }, [lastUpdate, triggerForceUpdate])

  // 수동 동기화 핸들러
  const handleManualSync = () => {
    console.log("모바일: 수동 동기화 시작")
    setIsLoading(true)

    setTimeout(() => {
      syncReservations()
      triggerForceUpdate()

      setTimeout(() => {
        setIsLoading(false)
        toast({
          title: "동기화 완료",
          description: "예약 데이터가 최신 상태로 업데이트되었습니다.",
        })
        console.log("모바일: 수동 동기화 완료")
      }, 500)
    }, 100)
  }

  // 이전/다음 날짜로 이동
  const goToPrevious = () => {
    setSelectedDate((prev) => subDays(prev, 1))
  }

  const goToNext = () => {
    setSelectedDate((prev) => addDays(prev, 1))
  }

  // 특정 차량과 시간에 예약이 있는지 확인
  const getReservationForTimeSlot = (carId: string, timeSlot: string, date: Date) => {
    const [hours, minutes] = timeSlot.split(":").map(Number)
    const slotTime = new Date(date)
    slotTime.setHours(hours, minutes, 0, 0)

    return reservations.find((reservation) => {
      const startTime = parseISO(reservation.startTime)
      const endTime = parseISO(reservation.endTime)
      return reservation.carId === carId && isSameDay(startTime, date) && slotTime >= startTime && slotTime < endTime
    })
  }

  // 선택된 날짜의 예약 필터링
  const getReservationsForDate = (date: Date) => {
    return reservations.filter((reservation) => {
      const startDate = parseISO(reservation.startTime)
      return isSameDay(startDate, date)
    })
  }

  const selectedDateReservations = getReservationsForDate(selectedDate)

  // 시간 슬롯 클릭 핸들러
  const handleTimeSlotClick = (carId: string, timeSlot: string) => {
    if (!user) {
      setIsLoginDialogOpen(true)
      return
    }

    // 예약된 시간인지 확인
    const reservation = getReservationForTimeSlot(carId, timeSlot, selectedDate)
    if (reservation) {
      toast({
        title: "예약 불가",
        description: "이미 예약된 시간입니다.",
        variant: "destructive",
      })
      return
    }

    const car = cars.find((c) => c.id === carId)
    if (!car) return

    if (selectedCar?.id === carId && selectedStartTime === timeSlot && !selectedEndTime) {
      setSelectedCar(null)
      setSelectedStartTime(null)
      setSelectedEndTime(null)
      return
    }

    // 시작 시간 선택
    if (!selectedStartTime || selectedCar?.id !== carId) {
      setSelectedStartTime(timeSlot)
      setSelectedEndTime(null)
      setSelectedCar(car)
    } else if (selectedStartTime && !selectedEndTime) {
      // 종료 시간 선택
      const startIndex = timeSlots.indexOf(selectedStartTime)
      const endIndex = timeSlots.indexOf(timeSlot)

      if (endIndex > startIndex) {
        setSelectedEndTime(timeSlot)
        // 예약 폼 초기화
        setFormData({
          pickupDate: selectedDate,
          returnDate: selectedDate,
          purpose: "",
          destination: "",
          isDirect: false,
          directReason: "",
          passengers: [],
          isMaintenanceReservation: false,
          maintenanceType: "",
          customMaintenanceType: "",
        })
        setIsReservationDialogOpen(true)
      } else {
        // 새로운 시작 시간 선택
        setSelectedStartTime(timeSlot)
        setSelectedEndTime(null)
      }
    } else {
      // 이미 시작/종료 시간이 모두 선택된 경우 초기화
      setSelectedStartTime(timeSlot)
      setSelectedEndTime(null)
      setSelectedCar(car)
    }
  }

  // 월별 달력에서 날짜 선택 핸들러
  const handleMonthlyDateSelect = (date: Date) => {
    setSelectedDate(date)
    setIsMonthlyViewOpen(false)
  }

  // 날짜 선택 핸들러
  const handleDateChange = (name: string, date: Date | undefined) => {
    if (!date) return

    setFormData({
      ...formData,
      [name]: date,
    })
  }

  // 예약 제출 핸들러
  const handleSubmitReservation = () => {
    if (!user || !selectedCar) return
    if (isSubmitting) return

    if (!selectedStartTime || !selectedEndTime) {
      toast({
        title: "시간 선택 필요",
        description: "시작 시간과 종료 시간을 모두 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 예약 시간 조합
      const pickupDateTime = new Date(formData.pickupDate)
      const [pickupHours, pickupMinutes] = selectedStartTime.split(":").map(Number)
      pickupDateTime.setHours(pickupHours, pickupMinutes, 0, 0)

      const returnDateTime = new Date(formData.returnDate)
      const [returnHours, returnMinutes] = selectedEndTime.split(":").map(Number)
      returnDateTime.setHours(returnHours, returnMinutes, 0, 0)
      returnDateTime.setMinutes(returnDateTime.getMinutes() + 30)

      const finalMaintenanceType =
        formData.maintenanceType === "기타" ? formData.customMaintenanceType : formData.maintenanceType

      // 새 예약 생성
      const newReservation: Reservation = {
        id: `r${Date.now()}`,
        carId: selectedCar.id,
        userId: user.id,
        userName: formData.isMaintenanceReservation ? finalMaintenanceType : user.name,
        userDepartment: user.department,
        startTime: pickupDateTime.toISOString(),
        endTime: returnDateTime.toISOString(),
        purpose: formData.purpose,
        destination: formData.destination,
        isDirect: formData.isDirect,
        directReason: formData.directReason,
        passengers: formData.passengers,
        isMaintenanceReservation: formData.isMaintenanceReservation,
        maintenanceType: finalMaintenanceType,
      }

      // 예약 추가
      addReservation(newReservation)
      setIsReservationDialogOpen(false)

      toast({
        title: "예약 완료",
        description: "차량 예약이 성공적으로 완료되었습니다.",
      })

      // 선택 상태 초기화
      setSelectedStartTime(null)
      setSelectedEndTime(null)
      setSelectedCar(null)

      // 강제 리렌더링
      triggerForceUpdate()
    } catch (error) {
      toast({
        title: "예약 실패",
        description: error instanceof Error ? error.message : "예약 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 동승자 추가 핸들러
  const handleAddPassenger = (userId: string) => {
    const selectedUser = sampleUsers.find((u) => u.id === userId)
    if (selectedUser && !formData.passengers.includes(userId)) {
      setFormData({
        ...formData,
        passengers: [...formData.passengers, userId],
      })
    }
  }

  // 동승자 제거 핸들러
  const handleRemovePassenger = (userId: string) => {
    setFormData({
      ...formData,
      passengers: formData.passengers.filter((id) => id !== userId),
    })
  }

  // 폼 입력 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isDirect: checked,
    })
  }

  // 사용자 이름 가져오기
  const getUserName = (userId: string) => {
    const user = sampleUsers.find((u) => u.id === userId)
    return user ? `${user.name} (${user.team})` : ""
  }

  // 현재 월의 날짜 배열 생성
  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() - firstDay.getDay())

    const endDate = new Date(lastDay)
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()))

    const days = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  // 예약하기 버튼 클릭 핸들러
  const handleReserveButtonClick = () => {
    if (!user) {
      setIsLoginDialogOpen(true)
      return
    }

    if (selectedCar && selectedStartTime && selectedEndTime) {
      setFormData({
        ...formData,
        pickupDate: selectedDate,
        returnDate: selectedDate,
      })
      setIsReservationDialogOpen(true)
      return
    }

    toast({
      title: "선택 필요",
      description: "차량과 시간을 선택해주세요.",
      variant: "destructive",
    })
  }

  // forceUpdate가 변경될 때마다 컴포넌트 리렌더링
  useEffect(() => {
    // 강제 리렌더링을 위한 useEffect
  }, [forceUpdate, reservations])

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>차량 예약</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsMonthlyViewOpen(!isMonthlyViewOpen)}>
              {isMonthlyViewOpen ? (
                <>
                  접기 <Plus className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  펼치기 <Plus className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 날짜 선택 영역 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center font-medium">
              {format(selectedDate, "yyyy년 M월 d일 (EEE)", { locale: ko })}
            </div>
            <Button variant="ghost" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* 요일 선택 */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDates.map((date) => {
              const isSunday = date.getDay() === 0
              const isSaturday = date.getDay() === 6
              const isSelected = isSameDay(date, selectedDate)

              let buttonClass = "p-1 h-auto rounded-full"
              if (isSelected) {
                buttonClass += " bg-black text-white"
              } else if (isSunday) {
                buttonClass += " text-red-500"
              } else if (isSaturday) {
                buttonClass += " text-blue-500"
              }

              return (
                <Button
                  key={date.toISOString()}
                  variant={isSelected ? "default" : "outline"}
                  className={buttonClass}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xs">{format(date, "EEE", { locale: ko })}</span>
                    <span className="text-sm font-bold">{format(date, "d")}</span>
                  </div>
                </Button>
              )
            })}
          </div>

          {/* 월별 보기 (접기/펼치기) */}
          {isMonthlyViewOpen && (
            <div className="border rounded-md p-4 mb-4">
              <div className="text-center mb-2 font-medium">{format(selectedDate, "yyyy년 M월", { locale: ko })}</div>
              <div className="grid grid-cols-7 gap-1">
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium">
                    {day}
                  </div>
                ))}
                {getDaysInMonth().map((date, i) => {
                  const isCurrentMonth = date.getMonth() === selectedDate.getMonth()
                  const isToday = isSameDay(date, new Date())
                  const isSelected = isSameDay(date, selectedDate)

                  return (
                    <Button
                      key={i}
                      variant="ghost"
                      size="sm"
                      className={`p-1 h-8 ${
                        isSelected
                          ? "bg-black text-white rounded-full"
                          : isToday
                            ? "border border-black rounded-full"
                            : !isCurrentMonth
                              ? "text-gray-300"
                              : ""
                      }`}
                      onClick={() => handleMonthlyDateSelect(date)}
                    >
                      {date.getDate()}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 차량별 타임라인 */}
        <div className="space-y-4">
          {cars.map((car) => (
            <div key={car.id} className="border rounded-lg overflow-hidden">
              {/* 차량 정보 헤더 */}
              <div className="flex items-center px-3 py-2 bg-gray-50 border-b">
                <div className="flex-shrink-0 h-8 w-8 relative">
                  <Image
                    src={car.image || "/placeholder.svg"}
                    alt={car.name}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="ml-2">
                  <div className="text-sm font-medium text-gray-900">{car.name}</div>
                  <div className="text-xs text-gray-500">{car.type}</div>
                </div>
              </div>

              {/* 타임슬롯 영역 */}
              <div className="p-2">
                <div className="flex overflow-x-auto gap-1" style={{ WebkitOverflowScrolling: "touch" }}>
                  {timeSlots.map((time) => {
                    const reservation = getReservationForTimeSlot(car.id, time, selectedDate)
                    const isReserved = !!reservation
                    const isSelected =
                      selectedCar?.id === car.id &&
                      (selectedStartTime === time ||
                        (selectedStartTime &&
                          selectedEndTime &&
                          timeSlots.indexOf(time) >= timeSlots.indexOf(selectedStartTime) &&
                          timeSlots.indexOf(time) <= timeSlots.indexOf(selectedEndTime)))

                    let cellStyle = "bg-gray-100 border-gray-300"
                    let textStyle = "text-gray-700"

                    if (isReserved) {
                      cellStyle = "bg-blue-200 border-blue-400"
                      textStyle = "text-blue-900 font-semibold"
                    } else if (isSelected) {
                      cellStyle = "bg-green-200 border-green-400"
                      textStyle = "text-green-900 font-semibold"
                    }

                    return (
                      <div
                        key={time}
                        className={`flex flex-col items-center justify-center rounded border cursor-pointer transition-colors ${cellStyle} ${textStyle}`}
                        style={{ minWidth: "50px", minHeight: "50px" }}
                        onClick={() => {
                          if (!isReserved) {
                            handleTimeSlotClick(car.id, time)
                          }
                        }}
                      >
                        <span className="text-xs font-medium">{time}</span>
                        {isReserved && (
                          <span className="text-[10px] truncate max-w-[45px]">
                            {reservation.isMaintenanceReservation
                              ? reservation.maintenanceType || "점검"
                              : reservation.userName}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 선택된 시간 표시 */}
        {selectedStartTime && selectedCar && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <div className="font-medium">{selectedCar.name}</div>
            <div className="text-sm">
              {format(selectedDate, "M월 d일", { locale: ko })} {selectedStartTime}
              {selectedEndTime ? ` - ${selectedEndTime}` : " (종료 시간을 선택하세요)"}
            </div>
            {!selectedEndTime && (
              <div className="mt-2 text-center text-[15px] font-semibold text-red-500 animate-pulse">
                종료 시간을 선택하세요
              </div>
            )}
          </div>
        )}

        {/* 버튼 공간 확보 */}
        <div className="h-16"></div>
      </CardContent>

      {/* 하단 안내문구: 시작 시간을 선택하세요 (파란색) */}
      {!selectedStartTime && !isReservationDialogOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10 flex justify-center items-center">
          <div className="text-[17px] font-semibold text-blue-600 animate-pulse">시작 시간을 선택하세요</div>
        </div>
      )}

      {/* 하단 안내문구: 종료 시간을 선택하세요 (빨간색, 기존과 동일) */}
      {selectedStartTime && !selectedEndTime && selectedCar && !isReservationDialogOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10 flex justify-center items-center">
          <div className="text-[17px] font-semibold text-red-500 animate-pulse">종료 시간을 선택하세요</div>
        </div>
      )}

      {/* 예약 다이얼로그 */}
      <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
        <DialogContent
         className="sm:max-w-md max-h-[90vh] overflow-y-hidden"
         style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
          touchAction: 'pan-y',
        }}
      >
          <DialogHeader>
            <DialogTitle>차량 예약</DialogTitle>
          </DialogHeader>
          <div
            ref={scrollDivRef}
            style={{
              maxHeight: '70vh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className="py-4 space-y-4"
          >
            {/* 선택된 정보 표시 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">예약 일시</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <Plus className="mr-2 h-4 w-4" />
                      {format(formData.pickupDate, "yyyy-MM-dd")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.pickupDate}
                      onSelect={(date) => handleDateChange("pickupDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Select value={selectedStartTime || "09:00"} onValueChange={setSelectedStartTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="시작 시간" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`start-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <Plus className="mr-2 h-4 w-4" />
                      {format(formData.returnDate, "yyyy-MM-dd")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.returnDate}
                      onSelect={(date) => handleDateChange("returnDate", date)}
                      disabled={(date) => date < formData.pickupDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Select value={selectedEndTime || "10:00"} onValueChange={setSelectedEndTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="종료 시간" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem
                        key={`end-${time}`}
                        value={time}
                        disabled={
                          selectedStartTime &&
                          isSameDay(formData.pickupDate, formData.returnDate) &&
                          time <= selectedStartTime
                        }
                      >
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {user?.role === "admin" && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isMaintenanceReservation"
                    checked={formData.isMaintenanceReservation}
                    onCheckedChange={(checked) => setFormData({ ...formData, isMaintenanceReservation: !!checked })}
                  />
                  <Label htmlFor="isMaintenanceReservation" className="text-sm font-medium">
                    특수 예약 (점검/정비/세차)
                  </Label>
                </div>

                {formData.isMaintenanceReservation && (
                  <div>
                    <Label className="text-sm font-medium">작업 유형</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="maintenance"
                          name="maintenanceType"
                          value="차량 점검"
                          checked={formData.maintenanceType === "차량 점검"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <Label htmlFor="maintenance" className="text-sm">
                          차량 점검
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="repair"
                          name="maintenanceType"
                          value="정비 작업"
                          checked={formData.maintenanceType === "정비 작업"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <Label htmlFor="repair" className="text-sm">
                          정비 작업
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="carwash"
                          name="maintenanceType"
                          value="세차 작업"
                          checked={formData.maintenanceType === "세차 작업"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <Label htmlFor="carwash" className="text-sm">
                          세차 작업
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="custom"
                          name="maintenanceType"
                          value="기타"
                          checked={formData.maintenanceType === "기타"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <Label htmlFor="custom" className="text-sm">
                          기타
                        </Label>
                      </div>
                    </div>
                    {formData.maintenanceType === "기타" && (
                      <div className="mt-2">
                        <Input
                          name="customMaintenanceType"
                          value={formData.customMaintenanceType || ""}
                          onChange={handleInputChange}
                          placeholder="기타 작업 내용을 입력하세요"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!formData.isMaintenanceReservation && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-sm font-medium">
                    이용 목적
                  </Label>
                  <Textarea
                    id="purpose"
                    name="purpose"
                    placeholder="이용 목적을 입력하세요"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="resize-none"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination" className="text-sm font-medium">
                    지역/방문지
                  </Label>
                  <Input
                    id="destination"
                    name="destination"
                    placeholder="방문할 장소나 지역을 입력하세요. ex) 용인/SG"
                    value={formData.destination}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="isDirect" checked={formData.isDirect} onCheckedChange={handleCheckboxChange} />
                  <Label htmlFor="isDirect" className="text-sm font-medium">
                    직출/직퇴 여부
                  </Label>
                </div>

                {formData.isDirect && (
                  <div className="space-y-2">
                    <Label htmlFor="directReason" className="text-sm font-medium">
                      직출/직퇴 사유
                    </Label>
                    <Input
                      id="directReason"
                      name="directReason"
                      placeholder="직출/직퇴 사유를 입력하세요"
                      value={formData.directReason}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium">동승자</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="이름, 부서 또는 팀명으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {searchTerm.trim() !== "" && filteredUsers.length > 0 && (
                      <div className="border rounded-md max-h-40 overflow-y-auto">
                        {filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            className="p-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleAddPassenger(user.id)}
                          >
                            <div className="text-sm font-medium">{user.name}</div>
                            <div className="text-xs text-gray-500">
                              {user.department} / {user.team}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="rounded-md border p-2 min-h-[60px]">
                      {formData.passengers.length === 0 ? (
                        <div className="text-sm text-gray-500 h-full flex items-center justify-center">
                          동승자가 없습니다.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {formData.passengers.map((passengerId) => (
                            <Badge key={passengerId} variant="secondary" className="gap-1 pl-2">
                              {getUserName(passengerId)}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 rounded-full"
                                onClick={() => handleRemovePassenger(passengerId)}
                              >
                                <Plus className="h-3 w-3 rotate-45" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReservationDialogOpen(false)} disabled={isSubmitting}>
              취소
            </Button>
            <Button
              onClick={handleSubmitReservation}
              className="bg-[#0e65b1] hover:bg-[#0a4f8d]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "예약 처리 중..." : "예약하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <LoginDialog externalOpen={isLoginDialogOpen} onExternalOpenChange={setIsLoginDialogOpen} />
    </Card>
  )
}
