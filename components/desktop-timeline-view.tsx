"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import {
  format,
  addDays,
  isSameDay,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  isValid,
} from "date-fns"
import { ko } from "date-fns/locale"
import { Plus, Users, MapPin } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useReservationStore } from "@/services/reservation-service"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { supabase } from "@/lib/supabaseClient"

// 예약 타입 정의
interface Reservation {
  id: string
  carId: string
  userId: string
  userName: string
  userDepartment: string
  startTime: string
  endTime: string
  purpose?: string
  destination?: string
  isDirect?: boolean
  directReason?: string
  passengers?: string[]
  isMaintenanceReservation?: boolean
  maintenanceType?: string
  status?: string
  carName?: string
  phoneNumber?: string
}

// 차량 타입 정의
interface CarType {
  id: string
  name: string
  image: string
  type: string
  color: string
  seats?: string
  location?: string
}

// 사용자 타입 정의
interface UserType {
  id: string
  name: string
  department: string
  team: string
}

// 드래그 상태 인터페이스
interface DragState {
  isDragging: boolean
  startCarId: string | null
  startTimeSlot: string | null
  endTimeSlot: string | null
  startIndex: number | null
  endIndex: number | null
}

// 30분 간격 시간 슬롯 생성 (08:00 ~ 20:00)
const timeSlots = []
for (let hour = 8; hour <= 20; hour++) {
  for (let minute = 0; minute < 60; minute += 30) {
    if (hour === 20 && minute > 0) break // 20:00까지만
    timeSlots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)
  }
}

export function DesktopTimelineView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("daily")
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 스크롤 컨테이너 참조
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 드래그 상태 관리
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startCarId: null,
    startTimeSlot: null,
    endTimeSlot: null,
    startIndex: null,
    endIndex: null,
  })

  // 예약 폼 상태
  const [formData, setFormData] = useState({
    pickupDate: new Date(),
    returnDate: new Date(),
    pickupTime: "09:00",
    returnTime: "11:00",
    purpose: "",
    destination: "",
    isDirect: false,
    directReason: "",
    passengers: [] as string[],
    isMaintenanceReservation: false,
    maintenanceType: "",
    customMaintenanceType: "",
  })

  // 동승자 검색 상태
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])

  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const { reservations, addReservation, updateReservation, deleteReservation, fetchReservations, subscribeToReservations, } = useReservationStore()

  // 샘플 차량 데이터
  const cars: CarType[] = [
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

  // 샘플 사용자 데이터
  const sampleUsers: UserType[] = [
    { id: "1", name: "관리자", department: "관리부", team: "관리팀" },
    { id: "2", name: "홍길동", department: "영업부", team: "영업1팀" },
    { id: "3", name: "김철수", department: "개발부", team: "개발1팀" },
    { id: "4", name: "이영희", department: "영업부", team: "영업2팀" },
    { id: "5", name: "박지성", department: "개발부", team: "개발2팀" },
    { id: "6", name: "손흥민", department: "마케팅부", team: "마케팅팀" },
    { id: "7", name: "김민재", department: "디자인부", team: "디자인팀" },
    { id: "8", name: "황희찬", department: "인사부", team: "인사팀" },
  ]

  // 선택된 날짜의 예약 필터링
  const dayReservations = reservations.filter((reservation) => {
    try {
      if (!selectedDate || !isValid(selectedDate)) return false
      const reservationDate = parseISO(reservation.startTime)
      return isValid(reservationDate) && isSameDay(reservationDate, selectedDate)
    } catch (error) {
      console.error("Invalid reservation date:", reservation.startTime)
      return false
    }
  })

  // 자동 스크롤 함수
  const startAutoScroll = useCallback((direction: "left" | "right") => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
    }

    autoScrollIntervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const scrollAmount = direction === "right" ? 50 : -50
        scrollContainerRef.current.scrollLeft += scrollAmount
      }
    }, 50)
  }, [])

  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
      autoScrollIntervalRef.current = null
    }
  }, [])

  // 마우스 위치에 따른 자동 스크롤 처리
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging || !scrollContainerRef.current) return

      const container = scrollContainerRef.current
      const rect = container.getBoundingClientRect()
      const mouseX = e.clientX
      const scrollThreshold = 100 // 경계에서 100px 이내에서 스크롤 시작

      if (mouseX < rect.left + scrollThreshold && container.scrollLeft > 0) {
        startAutoScroll("left")
      } else if (
        mouseX > rect.right - scrollThreshold &&
        container.scrollLeft < container.scrollWidth - container.clientWidth
      ) {
        startAutoScroll("right")
      } else {
        stopAutoScroll()
      }
    },
    [dragState.isDragging, startAutoScroll, stopAutoScroll],
  )

  // 드래그 종료 핸들러 - 수정된 부분
  const handleDragEnd = useCallback(() => {
    stopAutoScroll()

    if (
      dragState.isDragging &&
      dragState.startCarId &&
      dragState.startTimeSlot &&
      dragState.endTimeSlot &&
      dragState.startIndex !== null &&
      dragState.endIndex !== null &&
      selectedDate &&
      isValid(selectedDate)
    ) {
      const car = cars.find((c) => c.id === dragState.startCarId)
      if (car) {
        // 시작 시간과 종료 시간 정렬
        const startIndex = Math.min(dragState.startIndex, dragState.endIndex)
        const endIndex = Math.max(dragState.startIndex, dragState.endIndex)
        const startTimeSlot = timeSlotsOld[startIndex]
        const endTimeSlot = timeSlotsOld[endIndex]

        setSelectedCar(car)

        // 예약 폼 초기화
        const pickupDate = new Date(selectedDate)
        const [startHour, startMinute] = startTimeSlot.split(":").map(Number)
        pickupDate.setHours(startHour, startMinute, 0, 0)

        const returnDate = new Date(selectedDate)
        const [endHour, endMinute] = endTimeSlot.split(":").map(Number)
        returnDate.setHours(endHour, endMinute, 0, 0)
        // 종료 시간에 30분 추가 (슬롯의 끝까지 포함) - 드래그에서만 30분 추가
        returnDate.setMinutes(returnDate.getMinutes() + 30)

        setFormData({
          pickupDate,
          returnDate,
          pickupTime: startTimeSlot,
          returnTime: format(returnDate, "HH:mm"),
          purpose: "",
          destination: "",
          isDirect: false,
          directReason: "",
          passengers: [],
          isMaintenanceReservation: user?.role === "admin" ? false : false,
          maintenanceType: "",
          customMaintenanceType: "",
        })

        setIsReservationDialogOpen(true)
      }
    }

    setDragState({
      isDragging: false,
      startCarId: null,
      startTimeSlot: null,
      endTimeSlot: null,
      startIndex: null,
      endIndex: null,
    })
  }, [dragState, selectedDate, cars, user, stopAutoScroll])

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

  // 색상에 따른 배경색 클래스 반환
  const getColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100"
      case "green":
        return "bg-green-100"
      case "teal":
        return "bg-teal-100"
      case "purple":
        return "bg-purple-100"
      case "orange":
        return "bg-orange-100"
      case "red":
        return "bg-red-100"
      case "pink":
        return "bg-pink-100"
      default:
        return "bg-blue-100"
    }
  }

  // 색상에 따른 테두리 색상 클래스 반환
  const getBorderColor = (color: string) => {
    switch (color) {
      case "blue":
        return "#3b82f6"
      case "green":
        return "#10b981"
      case "teal":
        return "#14b8a6"
      case "purple":
        return "#8b5cf6"
      case "orange":
        return "#f97316"
      case "red":
        return "#ef4444"
      case "pink":
        return "#ec4899"
      default:
        return "#3b82f6"
    }
  }

  // 예약별 색상 변형 생성
  const getReservationColorClass = (color: string, index: number) => {
    const colorVariants = {
      blue: ["bg-blue-400", "bg-blue-500", "bg-blue-600"],
      green: ["bg-green-400", "bg-green-500", "bg-green-600"],
      teal: ["bg-teal-400", "bg-teal-500", "bg-teal-600"],
      purple: ["bg-purple-400", "bg-purple-500", "bg-purple-600"],
      orange: ["bg-orange-400", "bg-orange-500", "bg-orange-600"],
      red: ["bg-red-400", "bg-red-500", "bg-red-600"],
      pink: ["bg-pink-400", "bg-pink-500", "bg-pink-600"],
    }

    const variants = colorVariants[color as keyof typeof colorVariants] || ["bg-gray-400", "bg-gray-500", "bg-gray-600"]
    return variants[index % variants.length]
  }

  // 선택된 뷰 모드에 따라 날짜 범위 계산
  const getDateRange = () => {
    try {
      if (!selectedDate || !isValid(selectedDate)) {
        return [new Date()]
      }

      switch (viewMode) {
        case "daily":
          return [selectedDate]
        case "weekly":
          const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
          return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
        case "monthly":
          const monthStart = startOfMonth(selectedDate)
          const monthEnd = endOfMonth(selectedDate)
          const dayDiff = Math.ceil((monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
          return Array.from({ length: dayDiff }, (_, i) => addDays(monthStart, i))
        default:
          return [selectedDate]
      }
    } catch (error) {
      console.error("Error calculating date range:", error)
      return [new Date()]
    }
  }

  // 선택된 날짜 범위에 해당하는 예약만 필터링
  const getFilteredReservations = () => {
    const dateRange = getDateRange()
    return (reservations || []).filter((reservation) => {
      try {
        const startDate = parseISO(reservation.startTime)
        return isValid(startDate) && dateRange.some((date) => isSameDay(startDate, date))
      } catch (error) {
        console.error("Error filtering reservations:", error)
        return false
      }
    })
  }

  // 시간 범위 생성 (8시부터 18시까지, 30분 간격) - 18:00까지만
  const timeSlotsOld = []
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 18 && minute > 0) continue // 18:00까지만
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      timeSlotsOld.push(time)
    }
  }

  // 30분 단위 시간 옵션 (예약 다이얼로그용) - 18:00까지만
  const timeOptions = []
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 18 && minute > 0) continue // 18:00까지만
      timeOptions.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)
    }
  }

  // 이전 날짜/주/월로 이동
  const goToPrevious = () => {
    try {
      if (!selectedDate || !isValid(selectedDate)) return

      switch (viewMode) {
        case "daily":
          setSelectedDate(addDays(selectedDate, -1))
          break
        case "weekly":
          setSelectedDate(subWeeks(selectedDate, 1))
          break
        case "monthly":
          setSelectedDate(subMonths(selectedDate, 1))
          break
      }
    } catch (error) {
      console.error("Error going to previous:", error)
    }
  }

  // 다음 날짜/주/월로 이동
  const goToNext = () => {
    try {
      if (!selectedDate || !isValid(selectedDate)) return

      switch (viewMode) {
        case "daily":
          setSelectedDate(addDays(selectedDate, 1))
          break
        case "weekly":
          setSelectedDate(addWeeks(selectedDate, 1))
          break
        case "monthly":
          setSelectedDate(addMonths(selectedDate, 1))
          break
      }
    } catch (error) {
      console.error("Error going to next:", error)
    }
  }

  // 특정 시간 슬롯에 해당하는 예약 찾기
  const getReservationForTimeSlotOld = (carId: string, timeSlot: string, date: Date) => {
    if (!date || !isValid(date)) return null

    const [hour, minute] = timeSlot.split(":").map(Number)
    const slotTime = new Date(date)
    slotTime.setHours(hour, minute, 0, 0)

    return getFilteredReservations().find((reservation) => {
      try {
        const startTime = parseISO(reservation.startTime)
        const endTime = parseISO(reservation.endTime)

        if (!isValid(startTime) || !isValid(endTime)) {
          return false
        }

        return (
          reservation.carId === carId && isSameDay(startTime, date) && slotTime >= startTime && slotTime < endTime // 종료 시간은 포함하지 않음 (< 사용)
        )
      } catch (error) {
        console.error("Error checking reservation for time slot:", error)
        return false
      }
    })
  }

  // 예약의 시작 시간 슬롯 인덱스 계산
  const getReservationStartSlotIndexOld = (reservation: Reservation, date: Date) => {
    try {
      if (!date || !isValid(date)) return -1

      const startTime = parseISO(reservation.startTime)
      if (!isValid(startTime) || !isSameDay(startTime, date)) return -1

      const hour = startTime.getHours()
      const minute = startTime.getMinutes()
      const timeSlot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      return timeSlotsOld.indexOf(timeSlot)
    } catch (error) {
      console.error("Error getting reservation start slot index:", error)
      return -1
    }
  }

  // 예약의 종료 시간 슬롯 인덱스 계산 - 수정된 부분
  const getReservationEndSlotIndexOld = (reservation: Reservation, date: Date) => {
    try {
      if (!date || !isValid(date)) return timeSlotsOld.length - 1

      const endTime = parseISO(reservation.endTime)
      if (!isValid(endTime)) return timeSlotsOld.length - 1

      if (!isSameDay(endTime, date)) {
        // 다음 날로 넘어가는 경우 마지막 슬롯까지
        return timeSlotsOld.length - 1
      }

      const hour = endTime.getHours()
      const minute = endTime.getMinutes()

      // 종료 시간에 해당하는 정확한 슬롯 찾기
      for (let i = 0; i < timeSlotsOld.length; i++) {
        const [slotHour, slotMinute] = timeSlotsOld[i].split(":").map(Number)

        // 종료 시간이 현재 슬롯의 시작 시간과 정확히 일치하면
        // 이전 슬롯까지만 포함 (현재 슬롯은 포함하지 않음)
        if (hour === slotHour && minute === slotMinute) {
          return Math.max(0, i - 1)
        }

        // 종료 시간이 현재 슬롯의 시작 시간보다 이후이고
        // 다음 슬롯의 시작 시간보다 이전이면 현재 슬롯까지 포함
        if (i < timeSlotsOld.length - 1) {
          const [nextSlotHour, nextSlotMinute] = timeSlotsOld[i + 1].split(":").map(Number)

          if (
            (hour > slotHour || (hour === slotHour && minute > slotMinute)) &&
            (hour < nextSlotHour || (hour === nextSlotHour && minute < nextSlotMinute))
          ) {
            return i
          }
        }
      }

      // 마지막 슬롯보다 늦은 시간이면 마지막 슬롯까지
      return timeSlotsOld.length - 1
    } catch (error) {
      console.error("Error getting reservation end slot index:", error)
      return timeSlotsOld.length - 1
    }
  }

  // 예약 블록의 너비 계산 (슬롯 개수)
  const getReservationWidth = (reservation: Reservation, date: Date) => {
    const startIndex = getReservationStartSlotIndexOld(reservation, date)
    const endIndex = getReservationEndSlotIndexOld(reservation, date)
    if (startIndex === -1 || endIndex === -1) return 1
    return Math.max(1, endIndex - startIndex + 1)
  }

  // 날짜 표시 형식 설정
  const getDateDisplay = () => {
    try {
      if (!selectedDate || !isValid(selectedDate)) {
        return "Invalid Date"
      }

      switch (viewMode) {
        case "daily":
          return format(selectedDate, "PPP (E)", { locale: ko })
        case "weekly":
          const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
          const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
          return `${format(weekStart, "yyyy년 MM월 dd일", { locale: ko })} - ${format(weekEnd, "yyyy년 MM월 dd일", {
            locale: ko,
          })}`
        case "monthly":
          return format(selectedDate, "yyyy년 MM월", { locale: ko })
        default:
          return format(selectedDate, "PPP (E)", { locale: ko })
      }
    } catch (error) {
      console.error("Error formatting date display:", error)
      return "Invalid Date"
    }
  }

  // 타임슬롯 클릭 핸들러
  const handleTimeSlotClick = (carId: string, timeSlot: string, date: Date = selectedDate) => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "차량을 예약하려면 먼저 로그인해주세요.",
        variant: "destructive",
      })
      setIsLoginDialogOpen(true)
      return
    }

    if (!date || !isValid(date)) {
      toast({
        title: "오류",
        description: "유효하지 않은 날짜입니다.",
        variant: "destructive",
      })
      return
    }

    const car = cars.find((c) => c.id === carId)
    if (car) {
      setSelectedCar(car)
      setSelectedTimeSlot(timeSlot)

      const pickupDate = new Date(date)
      const [hour, minute] = timeSlot.split(":").map(Number)
      pickupDate.setHours(hour, minute, 0, 0)

      const returnDate = new Date(pickupDate)
      returnDate.setHours(returnDate.getHours() + 2)

      setFormData({
        pickupDate,
        returnDate,
        pickupTime: timeSlot,
        returnTime: format(returnDate, "HH:mm"),
        purpose: "",
        destination: "",
        isDirect: false,
        directReason: "",
        passengers: [],
        isMaintenanceReservation: user?.role === "admin" ? false : false,
        maintenanceType: "",
        customMaintenanceType: "",
      })

      setIsReservationDialogOpen(true)
    }
  }

  // 드래그 시작 핸들러
  const handleDragStart = (carId: string, timeSlot: string, index: number) => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "차량을 예약하려면 먼저 로그인해주세요.",
        variant: "destructive",
      })
      setIsLoginDialogOpen(true)
      return
    }

    setDragState({
      isDragging: true,
      startCarId: carId,
      startTimeSlot: timeSlot,
      endTimeSlot: timeSlot,
      startIndex: index,
      endIndex: index,
    })
  }

  // 드래그 오버 핸들러
  const handleDragOver = (carId: string, timeSlot: string, index: number) => {
    if (dragState.isDragging && dragState.startCarId === carId) {
      setDragState((prev) => ({
        ...prev,
        endTimeSlot: timeSlot,
        endIndex: index,
      }))
    }
  }

  // 드래그 중인 셀 스타일
  const getDraggedCellStyle = (carId: string, index: number) => {
    if (
      !dragState.isDragging ||
      dragState.startCarId !== carId ||
      dragState.startIndex === null ||
      dragState.endIndex === null
    ) {
      return ""
    }

    const startIndex = Math.min(dragState.startIndex, dragState.endIndex)
    const endIndex = Math.max(dragState.startIndex, dragState.endIndex)

    if (index >= startIndex && index <= endIndex) {
      const car = cars.find((c) => c.id === carId)
      return `${getColorClass(car?.color || "blue")} opacity-50`
    }

    return ""
  }

  // 특정 예약 클릭 핸들러
  const handleReservationClick = (reservation: Reservation) => {
    try {
      const isPastReservation = new Date(reservation.endTime) < new Date()

      if (user?.role === "admin" || (user?.id === reservation.userId && !isPastReservation)) {
        setSelectedReservation(reservation)

        const startTime = parseISO(reservation.startTime)
        const endTime = parseISO(reservation.endTime)

        if (!isValid(startTime) || !isValid(endTime)) {
          toast({
            title: "오류",
            description: "예약 시간 정보가 올바르지 않습니다.",
            variant: "destructive",
          })
          return
        }

        setFormData({
          pickupDate: startTime,
          returnDate: endTime,
          pickupTime: format(startTime, "HH:mm"),
          returnTime: format(endTime, "HH:mm"),
          purpose: reservation.purpose || "",
          destination: reservation.destination || "",
          isDirect: reservation.isDirect || false,
          directReason: reservation.directReason || "",
          passengers: reservation.passengers || [],
          isMaintenanceReservation: reservation.isMaintenanceReservation || false,
          maintenanceType: reservation.maintenanceType || "",
          customMaintenanceType: "",
        })

        setIsEditDialogOpen(true)
      } else if (isPastReservation && user?.id === reservation.userId) {
        toast({
          title: "수정 권한 없음",
          description: "이미 완료된 예약은 수정할 수 없습니다. 관리자에게 문의하세요.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "권한 없음",
          description: "본인의 예약만 수정할 수 있습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error handling reservation click:", error)
      toast({
        title: "오류",
        description: "예약 정보를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 사용자 이름 가져오기
  const getUserName = (userId: string) => {
    const user = sampleUsers.find((u) => u.id === userId)
    return user ? `${user.name} (${user.team})` : ""
  }

  function isReservationOverlap(carId, newStart, newEnd, reservations) {
    return reservations.some((r) =>
      r.carId === carId &&
      newStart < new Date(r.endTime) &&
      newEnd > new Date(r.startTime)
    );
  }

    // 예약 저장 함수(버튼 클릭 등)
  const handleSubmitReservation = () => {
    if (!user || !selectedCar) return

    setIsSubmitting(true)

    const pickupDateTime = new Date(formData.pickupDate)
    const [pickupHour, pickupMinute] = formData.pickupTime.split(":").map(Number)
    pickupDateTime.setHours(pickupHour, pickupMinute, 0, 0)

    const returnDateTime = new Date(formData.returnDate)
    const [returnHour, returnMinute] = formData.returnTime.split(":").map(Number)
    returnDateTime.setHours(returnHour, returnMinute, 0, 0)

    const finalMaintenanceType =
      formData.maintenanceType === "기타" ? formData.customMaintenanceType : formData.maintenanceType

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

    // 중복 예약 체크!
    const overlap = isReservationOverlap(
      newReservation.carId,
      new Date(newReservation.startTime),
      new Date(newReservation.endTime),
      reservations
    );

    if (overlap) {
      toast({
        title: "중복 예약",
        description: "이미 예약된 시간과 겹칩니다. 다른 시간으로 예약해 주세요.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      addReservation(newReservation)
      setIsSubmitting(false)
      setIsReservationDialogOpen(false)
      toast({
        title: "예약 완료",
        description: "차량 예약이 성공적으로 완료되었습니다.",
      })
    }, 1000)
  }

  // 예약 수정 핸들러
  const handleUpdateReservation = () => {
    if (!user || !selectedReservation) return

    setIsSubmitting(true)

    const pickupDateTime = new Date(formData.pickupDate)
    const [pickupHour, pickupMinute] = formData.pickupTime.split(":").map(Number)
    pickupDateTime.setHours(pickupHour, pickupMinute, 0, 0)

    const returnDateTime = new Date(formData.returnDate)
    const [returnHour, returnMinute] = formData.returnTime.split(":").map(Number)
    returnDateTime.setHours(returnHour, returnMinute, 0, 0)

    const finalMaintenanceType =
      formData.maintenanceType === "기타" ? formData.customMaintenanceType : formData.maintenanceType

    setTimeout(() => {
      updateReservation(selectedReservation.id, {
        startTime: pickupDateTime.toISOString(),
        endTime: returnDateTime.toISOString(),
        purpose: formData.purpose,
        destination: formData.destination,
        isDirect: formData.isDirect,
        directReason: formData.directReason,
        passengers: formData.passengers,
        userName: formData.isMaintenanceReservation ? finalMaintenanceType : selectedReservation.userName,
        isMaintenanceReservation: formData.isMaintenanceReservation,
        maintenanceType: finalMaintenanceType,
      })

      setIsSubmitting(false)
      setIsEditDialogOpen(false)

      toast({
        title: "예약 수정 완료",
        description: "차량 예약이 성공적으로 수정되었습니다.",
      })
    }, 1000)
  }

  // 예약 삭제 핸들러
  const handleDeleteReservation = () => {
    if (!selectedReservation) return

    setIsSubmitting(true)

    setTimeout(() => {
      deleteReservation(selectedReservation.id)
      setIsSubmitting(false)
      setIsDeleteAlertOpen(false)
      setIsEditDialogOpen(false)

      toast({
        title: "예약 삭제 완료",
        description: "차량 예약이 성공적으로 삭제되었습니다.",
      })
    }, 1000)
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
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    })
  }

  // 시간 선택 핸들러
  const handleTimeChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // 날짜 선택 핸들러
  const handleDateChange = (name: string, date: Date | undefined) => {
    if (!date) return

    setFormData({
      ...formData,
      [name]: date,
    })
  }

  // 일별 뷰 렌더링 (통합된 예약 블록)
  const renderDailyView = () => {
    if (!selectedDate || !isValid(selectedDate)) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">유효하지 않은 날짜입니다.</p>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto" ref={scrollContainerRef}>
        <div className="inline-block min-w-full align-middle">
          <div className="border rounded-lg" style={{ overflow: "visible" }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64"
                  >
                    차량
                  </th>
                  {timeSlotsOld.map((time, index) => (
                    <th
                      key={time}
                      scope="col"
                      className={`px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[40px] ${
                        index % 2 === 0 ? "border-l-2 border-gray-300" : "border-l border-gray-200 border-dashed"
                      }`}
                    >
                      {index % 2 === 0 ? time.split(":")[0] : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cars.map((car, carIndex) => (
                  <tr key={car.id} className="h-8">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center group relative">
                        <div className="flex-shrink-0 h-8 w-8 relative">
                          <Image
                            src={car.image || "/placeholder.svg"}
                            alt={car.name}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{car.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>{car.type}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {car.seats}인승
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {car.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {timeSlotsOld.map((time, index) => {
                      const reservation = getReservationForTimeSlotOld(car.id, time, selectedDate)
                      const draggedStyle = getDraggedCellStyle(car.id, index)

                      // 이 슬롯이 예약의 시작 슬롯인지 확인
                      const isReservationStart =
                        reservation && getReservationStartSlotIndexOld(reservation, selectedDate) === index

                      // 예약이 있지만 시작 슬롯이 아닌 경우 (중간 슬롯)
                      const isReservationMiddle = reservation && !isReservationStart

                      return (
                        <td
                          key={`${car.id}-${time}`}
                          className={`px-1 py-2 whitespace-nowrap text-center text-xs relative ${
                            index % 2 === 0 ? "border-l-2 border-gray-300" : "border-l border-gray-200 border-dashed"
                          } ${
                            isReservationStart
                              ? getColorClass(car.color) + " group cursor-pointer"
                              : isReservationMiddle
                                ? getColorClass(car.color) + " cursor-pointer"
                                : draggedStyle || "hover:bg-gray-100 cursor-pointer"
                          }`}
                          style={
                            isReservationStart && reservation
                              ? {
                                  position: "relative",
                                  zIndex: 2,
                                }
                              : isReservationMiddle
                                ? {
                                    borderLeft: "none",
                                    borderRight: "none",
                                  }
                                : {}
                          }
                          onMouseDown={() => !reservation && handleDragStart(car.id, time, index)}
                          onMouseOver={() => !reservation && handleDragOver(car.id, time, index)}
                          onMouseUp={handleDragEnd}
                          onClick={() => {
                            if (reservation) {
                              handleReservationClick(reservation)
                            } else if (!dragState.isDragging) {
                              handleTimeSlotClick(car.id, time)
                            }
                          }}
                        >
                          {isReservationStart && reservation ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`absolute inset-0 ${getColorClass(car.color)} rounded flex flex-col items-center justify-center text-xs font-medium cursor-pointer group`}
                                  style={{
                                    width: `${getReservationWidth(reservation, selectedDate) * 100}%`,
                                    minWidth: "40px",
                                    zIndex: 2,
                                    border: `2px solid ${getBorderColor(car.color)}`,
                                    borderRadius: "4px",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleReservationClick(reservation)
                                  }}
                                >
                                  <span className="text-gray-800 truncate px-1 font-semibold">
                                    {reservation.isMaintenanceReservation
                                      ? reservation.maintenanceType || "차량 점검"
                                      : reservation.userName}
                                  </span>
                                  <span className="text-gray-600 text-xs mt-0.5">
                                    {isValid(parseISO(reservation.startTime)) && format(parseISO(reservation.startTime), "HH:mm")}
                                    ~
                                    {isValid(parseISO(reservation.endTime)) && format(parseISO(reservation.endTime), "HH:mm")}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side={carIndex < 3 ? "bottom" : "top"}>
                                {/* 여기에 기존 툴팁 내용 그대로 복사해서 붙여넣기 */}
                                <h4 className="font-bold text-sm mb-2 text-gray-900">
                                  {reservation.isMaintenanceReservation
                                    ? `${reservation.maintenanceType || "차량 점검"} 예약`
                                    : `${reservation.userName}님의 예약`}
                                </h4>
                                <p className="text-xs mb-1 text-gray-700">
                                  <span className="font-medium">시간:</span>{" "}
                                  {isValid(parseISO(reservation.startTime)) && format(parseISO(reservation.startTime), "HH:mm")}{" "}
                                  -{" "}
                                  {isValid(parseISO(reservation.endTime)) && format(parseISO(reservation.endTime), "HH:mm")}
                                </p>
                                {!reservation.isMaintenanceReservation && (
                                  <>
                                    <p className="text-xs mb-1 text-gray-700">
                                      <span className="font-medium">부서:</span> {reservation.userDepartment}
                                    </p>
                                    {reservation.purpose && (
                                      <p className="text-xs mb-1 text-gray-700">
                                        <span className="font-medium">목적:</span> {reservation.purpose}
                                      </p>
                                    )}
                                    {reservation.destination && (
                                      <p className="text-xs mb-1 text-gray-700">
                                        <span className="font-medium">목적지:</span> {reservation.destination}
                                      </p>
                                    )}
                                    {reservation.passengers && reservation.passengers.length > 0 && (
                                      <p className="text-xs text-gray-700">
                                        <span className="font-medium">동승자:</span>{" "}
                                        {reservation.passengers.map((id) => getUserName(id)).join(", ")}
                                      </p>
                                    )}
                                  </>
                                )}
                              </TooltipContent>
                            </Tooltip>

                          ) : isReservationMiddle ? (
                            // 중간 슬롯은 클릭 가능한 빈 공간 (테두리 없음)
                            <div
                              className="h-full w-full cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleReservationClick(reservation!)
                              }}
                            ></div>
                          ) : (
                            <div className="opacity-0 hover:opacity-100 flex justify-center">
                              <Plus className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // 주별 뷰 렌더링 (간소화된 버전)
  const renderWeeklyView = () => {
    const dateRange = getDateRange()
    return (
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="border rounded-lg" style={{ overflow: "visible" }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64"
                  >
                    차량
                  </th>
                  {dateRange.map((date) => (
                    <th
                      key={date.toISOString()}
                      scope="col"
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] border-l-2 border-gray-300"
                    >
                      <div className="font-medium">{format(date, "EEE", { locale: ko })}</div>
                      <div className="text-xs text-gray-400">{format(date, "MM/dd", { locale: ko })}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cars.map((car, carIndex) => (
                  <tr key={car.id} className="h-16">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center group relative">
                        <div className="flex-shrink-0 h-8 w-8 relative">
                          <Image
                            src={car.image || "/placeholder.svg"}
                            alt={car.name}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{car.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>{car.type}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {car.seats}인승
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {car.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {dateRange.map((date) => {
                      const dayReservations = getFilteredReservations().filter((reservation) => {
                        try {
                          const reservationDate = parseISO(reservation.startTime)
                          return (
                            reservation.carId === car.id && isValid(reservationDate) && isSameDay(reservationDate, date)
                          )
                        } catch (error) {
                          return false
                        }
                      })

                      return (
                        <td
                          key={`${car.id}-${date.toISOString()}`}
                          className="px-2 py-2 text-center border-l-2 border-gray-300 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleTimeSlotClick(car.id, "09:00", date)}
                        >
                          {dayReservations.length > 0 ? (
                            <div className="space-y-1">
                              {dayReservations.slice(0, 3).map((reservation, index) => (
                                <div
                                  key={reservation.id}
                                  className={`text-xs px-2 py-1 rounded text-white ${getReservationColorClass(
                                    car.color,
                                    index,
                                  )} cursor-pointer`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleReservationClick(reservation)
                                  }}
                                >
                                  <div className="font-medium truncate">
                                    {reservation.isMaintenanceReservation
                                      ? reservation.maintenanceType || "점검"
                                      : reservation.userName}
                                  </div>
                                  <div className="text-xs opacity-90">
                                    {isValid(parseISO(reservation.startTime)) &&
                                      format(parseISO(reservation.startTime), "HH:mm")}
                                    ~
                                    {isValid(parseISO(reservation.endTime)) &&
                                      format(parseISO(reservation.endTime), "HH:mm")}
                                  </div>
                                </div>
                              ))}
                              {dayReservations.length > 3 && (
                                <div className="text-gray-500 text-xs">+{dayReservations.length - 3} more</div>
                              )}
                            </div>
                          ) : (
                            <div className="opacity-0 hover:opacity-100 flex justify-center">
                              <Plus className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // 월별 뷰 렌더링 (간소화된 버전)
  const renderMonthlyView = () => {
    const dateRange = getDateRange()
    return (
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="border rounded-lg" style={{ overflow: "visible" }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64"
                  >
                    차량
                  </th>
                  {dateRange.map((date) => (
                    <th
                      key={date.toISOString()}
                      scope="col"
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px] border-l-2 border-gray-300"
                    >
                      <div className="font-medium">{format(date, "EEE", { locale: ko })}</div>
                      <div className="text-xs text-gray-400">{format(date, "MM/dd", { locale: ko })}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cars.map((car, carIndex) => (
                  <tr key={car.id} className="h-16">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center group relative">
                        <div className="flex-shrink-0 h-8 w-8 relative">
                          <Image
                            src={car.image || "/placeholder.svg"}
                            alt={car.name}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{car.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>{car.type}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {car.seats}인승
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {car.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {dateRange.map((date) => {
                      const dayReservations = getFilteredReservations().filter((reservation) => {
                        try {
                          const reservationDate = parseISO(reservation.startTime)
                          return (
                            reservation.carId === car.id && isValid(reservationDate) && isSameDay(reservationDate, date)
                          )
                        } catch (error) {
                          return false
                        }
                      })

                      return (
                        <td
                          key={`${car.id}-${date.toISOString()}`}
                          className="px-2 py-2 text-center border-l-2 border-gray-300 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleTimeSlotClick(car.id, "09:00", date)}
                        >
                          {dayReservations.length > 0 ? (
                            <div className="space-y-1">
                              {dayReservations.slice(0, 2).map((reservation, index) => (
                                <div
                                  key={reservation.id}
                                  className={`text-xs px-2 py-1 rounded text-white ${getReservationColorClass(
                                    car.color,
                                    index,
                                  )} cursor-pointer`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleReservationClick(reservation)
                                  }}
                                >
                                  <div className="font-medium truncate">
                                    {reservation.isMaintenanceReservation
                                      ? reservation.maintenanceType || "점검"
                                      : reservation.userName}
                                  </div>
                                  <div className="text-xs opacity-90">
                                    {isValid(parseISO(reservation.startTime)) &&
                                      format(parseISO(reservation.startTime), "HH:mm")}
                                    ~
                                    {isValid(parseISO(reservation.endTime)) &&
                                      format(parseISO(reservation.endTime), "HH:mm")}
                                  </div>
                                </div>
                              ))}
                              {dayReservations.length > 2 && (
                                <div className="text-gray-500 text-xs">+{dayReservations.length - 2} more</div>
                              )}
                            </div>
                          ) : (
                            <div className="opacity-0 hover:opacity-100 flex justify-center">
                              <Plus className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // 초기 데이터 로드
  useEffect(() => {
    fetchReservations()
    const channel = subscribeToReservations()
    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [fetchReservations, subscribeToReservations])

  // 마우스 이벤트 리스너 등록
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleDragEnd)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleDragEnd)
        stopAutoScroll()
      }
    }
  }, [dragState.isDragging, handleMouseMove, handleDragEnd, stopAutoScroll])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button onClick={goToPrevious} className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{getDateDisplay()}</h2>
          <button onClick={goToNext} className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("daily")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                viewMode === "daily" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              일별
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                viewMode === "weekly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              주별
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                viewMode === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              월별
            </button>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === "daily" && renderDailyView()}
      {viewMode === "weekly" && renderWeeklyView()}
      {viewMode === "monthly" && renderMonthlyView()}

      {/* 예약 다이얼로그 */}
      {isReservationDialogOpen && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">차량 예약</h3>
              <button onClick={() => setIsReservationDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">선택된 차량</label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 relative">
                    <Image
                      src={selectedCar.image || "/placeholder.svg"}
                      alt={selectedCar.name}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{selectedCar.name}</div>
                    <div className="text-xs text-gray-500">{selectedCar.type}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">출발 시간</label>
                  <select
                    value={formData.pickupTime}
                    onChange={(e) => handleTimeChange("pickupTime", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">반납 시간</label>
                  <select
                    value={formData.returnTime}
                    onChange={(e) => handleTimeChange("returnTime", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {user?.role === "admin" && (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isMaintenanceReservation"
                      checked={formData.isMaintenanceReservation}
                      onChange={(e) => handleCheckboxChange("isMaintenanceReservation", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isMaintenanceReservation" className="ml-2 block text-sm text-gray-900">
                      관리자 예약 (점검/정비/세차)
                    </label>
                  </div>

                  {formData.isMaintenanceReservation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">작업 유형</label>
                      <select
                        value={formData.maintenanceType}
                        onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">작업 유형 선택</option>
                        <option value="차량 점검">차량 점검</option>
                        <option value="정비 작업">정비 작업</option>
                        <option value="세차 작업">세차 작업</option>
                        <option value="기타">기타</option>
                      </select>

                      {formData.maintenanceType === "기타" && (
                        <div className="mt-2">
                          <input
                            type="text"
                            name="customMaintenanceType"
                            value={formData.customMaintenanceType}
                            onChange={handleInputChange}
                            placeholder="작업 유형을 입력하세요"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!formData.isMaintenanceReservation && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">사용 목적</label>
                    <input
                      type="text"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      placeholder="사용 목적을 입력하세요"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">목적지</label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="목적지를 입력하세요"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isDirect"
                        checked={formData.isDirect}
                        onChange={(e) => handleCheckboxChange("isDirect", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isDirect" className="ml-2 block text-sm text-gray-900">
                        직출/직퇴 여부
                      </label>
                    </div>

                    {formData.isDirect && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">직출/직퇴 사유</label>
                        <input
                          type="text"
                          name="directReason"
                          value={formData.directReason}
                          onChange={handleInputChange}
                          placeholder="직출/직퇴 사유를 입력하세요"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">동승자 검색</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="이름, 부서, 팀으로 검색"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {searchTerm.trim() !== "" && (
                      <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              onClick={() => handleAddPassenger(user.id)}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="text-sm font-medium">{user.name}</div>
                              <div className="text-xs text-gray-500">
                                {user.department} - {user.team}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">검색 결과가 없습니다.</div>
                        )}
                      </div>
                    )}

                    {formData.passengers.length > 0 && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">선택된 동승자</label>
                        <div className="space-y-1">
                          {formData.passengers.map((userId) => {
                            const passenger = sampleUsers.find((u) => u.id === userId)
                            return (
                              <div
                                key={userId}
                                className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md"
                              >
                                <div>
                                  <div className="text-sm font-medium">{passenger?.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {passenger?.department} - {passenger?.team}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemovePassenger(userId)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsReservationDialogOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmitReservation}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "예약 중..." : "예약하기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 예약 수정 다이얼로그 */}
      {isEditDialogOpen && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">예약 수정</h3>
              <button onClick={() => setIsEditDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">차량</label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 relative">
                    <Image
                      src={cars.find((c) => c.id === selectedReservation.carId)?.image || "/placeholder.svg"}
                      alt={cars.find((c) => c.id === selectedReservation.carId)?.name || "차량"}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {cars.find((c) => c.id === selectedReservation.carId)?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {cars.find((c) => c.id === selectedReservation.carId)?.type}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">출발 시간</label>
                  <select
                    value={formData.pickupTime}
                    onChange={(e) => handleTimeChange("pickupTime", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">반납 시간</label>
                  <select
                    value={formData.returnTime}
                    onChange={(e) => handleTimeChange("returnTime", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {user?.role === "admin" && (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isMaintenanceReservationEdit"
                      checked={formData.isMaintenanceReservation}
                      onChange={(e) => handleCheckboxChange("isMaintenanceReservation", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isMaintenanceReservationEdit" className="ml-2 block text-sm text-gray-900">
                      관리자 예약 (점검/정비/세차)
                    </label>
                  </div>

                  {formData.isMaintenanceReservation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">작업 유형</label>
                      <select
                        value={formData.maintenanceType}
                        onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">작업 유형 선택</option>
                        <option value="차량 점검">차량 점검</option>
                        <option value="정비 작업">정비 작업</option>
                        <option value="세차 작업">세차 작업</option>
                        <option value="기타">기타</option>
                      </select>

                      {formData.maintenanceType === "기타" && (
                        <div className="mt-2">
                          <input
                            type="text"
                            name="customMaintenanceType"
                            value={formData.customMaintenanceType}
                            onChange={handleInputChange}
                            placeholder="작업 유형을 입력하세요"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!formData.isMaintenanceReservation && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">사용 목적</label>
                    <input
                      type="text"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      placeholder="사용 목적을 입력하세요"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">목적지</label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="목적지를 입력하세요"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isDirectEdit"
                        checked={formData.isDirect}
                        onChange={(e) => handleCheckboxChange("isDirect", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isDirectEdit" className="ml-2 block text-sm text-gray-900">
                        직출/직퇴 여부
                      </label>
                    </div>

                    {formData.isDirect && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">직출/직퇴 사유</label>
                        <input
                          type="text"
                          name="directReason"
                          value={formData.directReason}
                          onChange={handleInputChange}
                          placeholder="직출/직퇴 사유를 입력하세요"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">동승자 검색</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="이름, 부서, 팀으로 검색"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {searchTerm.trim() !== "" && (
                      <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              onClick={() => handleAddPassenger(user.id)}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="text-sm font-medium">{user.name}</div>
                              <div className="text-xs text-gray-500">
                                {user.department} - {user.team}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">검색 결과가 없습니다.</div>
                        )}
                      </div>
                    )}

                    {formData.passengers.length > 0 && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">선택된 동승자</label>
                        <div className="space-y-1">
                          {formData.passengers.map((userId) => {
                            const passenger = sampleUsers.find((u) => u.id === userId)
                            return (
                              <div
                                key={userId}
                                className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md"
                              >
                                <div>
                                  <div className="text-sm font-medium">{passenger?.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {passenger?.department} - {passenger?.team}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemovePassenger(userId)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsDeleteAlertOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  삭제
                </button>
                <button
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  취소
                </button>
                <button
                  onClick={handleUpdateReservation}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "수정 중..." : "수정하기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      {isDeleteAlertOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">예약 삭제</h3>
            <p className="text-gray-600 mb-6">정말로 이 예약을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeleteAlertOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                취소
              </button>
              <button
                onClick={handleDeleteReservation}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 로그인 다이얼로그 */}
      {isLoginDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">로그인 필요</h3>
            <p className="text-gray-600 mb-6">차량을 예약하려면 먼저 로그인해주세요.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsLoginDialogOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setIsLoginDialogOpen(false)
                  router.push("/login")
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
