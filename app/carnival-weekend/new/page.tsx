"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format, addDays } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

// 주말 사용 신청 타입
interface WeekendRequest {
  id: string
  userId: string
  userName: string
  userDepartment: string
  startDate: string
  endDate: string
  destination: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  beforeImages?: string[]
  afterImages?: string[]
}

export default function NewWeekendRequestPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState<string>("09:00")
  const [endTime, setEndTime] = useState<string>("18:00")
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false)
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false)
  const [destination, setDestination] = useState<string>("")
  const [beforeImages, setBeforeImages] = useState<File[]>([])
  const [afterImages, setAfterImages] = useState<File[]>([])
  const [beforeImagePreviews, setBeforeImagePreviews] = useState<string[]>([])
  const [afterImagePreviews, setAfterImagePreviews] = useState<string[]>([])

  // 시간 옵션 생성
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 20 && minute > 0) continue
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        options.push(`${formattedHour}:${formattedMinute}`)
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      setStartDate(date)
      // 종료일이 시작일보다 이전이면 시작일로 설정
      if (!endDate || endDate < date) {
        setEndDate(date)
      }
      setIsStartCalendarOpen(false)
    }
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      setEndDate(date)
      setIsEndCalendarOpen(false)
    }
  }

  // 이미지 파일 처리
  const handleImageUpload = (files: FileList | null, type: "before" | "after") => {
    if (!files) return

    const fileArray = Array.from(files)
    const validFiles = fileArray.filter((file) => file.type.startsWith("image/"))

    if (validFiles.length !== fileArray.length) {
      toast({
        title: "파일 형식 오류",
        description: "이미지 파일만 업로드 가능합니다.",
        variant: "destructive",
      })
      return
    }

    if (type === "before") {
      if (beforeImages.length + validFiles.length > 5) {
        toast({
          title: "파일 개수 초과",
          description: "최대 5개의 이미지만 업로드 가능합니다.",
          variant: "destructive",
        })
        return
      }
      setBeforeImages((prev) => [...prev, ...validFiles])

      // 미리보기 생성
      validFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setBeforeImagePreviews((prev) => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    } else {
      if (afterImages.length + validFiles.length > 5) {
        toast({
          title: "파일 개수 초과",
          description: "최대 5개의 이미지만 업로드 가능합니다.",
          variant: "destructive",
        })
        return
      }
      setAfterImages((prev) => [...prev, ...validFiles])

      // 미리보기 생성
      validFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setAfterImagePreviews((prev) => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // 이미지 삭제
  const removeImage = (index: number, type: "before" | "after") => {
    if (type === "before") {
      setBeforeImages((prev) => prev.filter((_, i) => i !== index))
      setBeforeImagePreviews((prev) => prev.filter((_, i) => i !== index))
    } else {
      setAfterImages((prev) => prev.filter((_, i) => i !== index))
      setAfterImagePreviews((prev) => prev.filter((_, i) => i !== index))
    }
  }

  // 예약 불가능한 날짜 확인 (예시: 과거 날짜)
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "주말 차량을 예약하려면 먼저 로그인해주세요.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!startDate || !endDate) {
      toast({
        title: "날짜 선택 필요",
        description: "시작일과 종료일을 모두 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!destination.trim()) {
      toast({
        title: "목적지 입력 필요",
        description: "목적지를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 날짜 범위가 4일을 초과하는지 확인
    const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    if (dayDiff > 3) {
      toast({
        title: "예약 기간 초과",
        description: "최대 3박 4일까지 예약 가능합니다.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // 새 주말 사용 신청 생성
    const newRequest: WeekendRequest = {
      id: `w${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userDepartment: user.department,
      startDate: new Date(
        startDate.setHours(Number.parseInt(startTime.split(":")[0]), Number.parseInt(startTime.split(":")[1])),
      ).toISOString(),
      endDate: new Date(
        endDate.setHours(Number.parseInt(endTime.split(":")[0]), Number.parseInt(endTime.split(":")[1])),
      ).toISOString(),
      destination: destination,
      status: "pending",
      createdAt: new Date().toISOString(),
      beforeImages: beforeImagePreviews,
      afterImages: afterImagePreviews,
    }

    // 로컬 스토리지에 저장
    try {
      // 기존 데이터 가져오기
      const existingData = localStorage.getItem("carnival-weekend-requests")
      const requests = existingData ? JSON.parse(existingData) : []

      // 새 요청 추가
      requests.push(newRequest)

      // 저장
      localStorage.setItem("carnival-weekend-requests", JSON.stringify(requests))

      // 커스텀 이벤트 발생 (같은 탭 내에서의 변경 알림)
      window.dispatchEvent(new Event("carnival-weekend-updated"))

      // 스토리지 이벤트 발생 (다른 탭/창에 변경 알림)
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "carnival-weekend-requests",
          newValue: JSON.stringify(requests),
        }),
      )

      setTimeout(() => {
        setIsSubmitting(false)
        toast({
          title: "신청 완료",
          description: "카니발 주말 사용 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.",
        })
        router.push("/carnival-weekend")
      }, 1000)
    } catch (error) {
      setIsSubmitting(false)
      toast({
        title: "신청 실패",
        description: "신청 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  // 날짜 표시 형식
  const formatDateRange = () => {
    if (!startDate) return "시작일 선택"
    if (!endDate) return format(startDate, "yyyy년 MM월 dd일 (EEE)", { locale: ko })

    if (startDate.getTime() === endDate.getTime()) {
      return format(startDate, "yyyy년 MM월 dd일 (EEE)", { locale: ko })
    }

    return `${format(startDate, "yyyy년 MM월 dd일", { locale: ko })} - ${format(endDate, "yyyy년 MM월 dd일", { locale: ko })}`
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

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>카니발 주말 사용 신청</CardTitle>
              <CardDescription>카니발 (223허 9561) 차량의 주말 사용을 신청합니다.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">사용 기간 (최대 3박 4일)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "MM/dd (EEE)", { locale: ko }) : "시작일"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={handleStartDateSelect}
                          disabled={isDateDisabled}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "MM/dd (EEE)", { locale: ko }) : "종료일"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={handleEndDateSelect}
                          disabled={(date) => {
                            if (isDateDisabled(date)) return true
                            if (!startDate) return false
                            // 시작일로부터 3일 이후는 선택 불가
                            return date > addDays(startDate, 3) || date < startDate
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="text-xs text-gray-500">{formatDateRange()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time" className="text-sm font-medium">
                      시작 시간
                    </Label>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger id="start-time">
                        <SelectValue placeholder="시간 선택" />
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
                  <div className="space-y-2">
                    <Label htmlFor="end-time" className="text-sm font-medium">
                      종료 시간
                    </Label>
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger id="end-time">
                        <SelectValue placeholder="시간 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions
                          .filter((time) => time > startTime)
                          .map((time) => (
                            <SelectItem key={`end-${time}`} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination" className="text-sm font-medium">
                    목적지
                  </Label>
                  <Input
                    id="destination"
                    placeholder="방문할 장소를 입력하세요"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>

                {/* 출발 전 사진 업로드 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">출발 전 계기판 및 차량 사진 (최대 5장)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files, "before")}
                      className="hidden"
                      id="before-images"
                    />
                    <label htmlFor="before-images" className="flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">클릭하여 이미지 업로드</p>
                    </label>
                  </div>
                  {beforeImagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {beforeImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`출발 전 사진 ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeImage(index, "before")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 출발 후 사진 업로드 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">반납 후 계기판 및 차량 사진 (최대 5장)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files, "after")}
                      className="hidden"
                      id="after-images"
                    />
                    <label htmlFor="after-images" className="flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">클릭하여 이미지 업로드</p>
                    </label>
                  </div>
                  {afterImagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {afterImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`반납 후 사진 ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeImage(index, "after")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-md bg-blue-50 p-4 text-blue-700 text-sm">
                  <p className="font-medium mb-2">주말 사용 안내</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>주말 사용은 관리자 승인 후 이용 가능합니다.</li>
                    <li>최대 3박 4일까지 연속 사용 가능합니다.</li>
                    <li>평일도 특수한 경우 예약 가능합니다.</li>
                    <li>이용 전/후 계기판 및 차량 사진을 업로드해야 합니다.</li>
                    <li>차량 내부 청결을 유지해주세요.</li>
                    <li>연료는 최소 절반 이상 채워서 반납해주세요.</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href="/carnival-weekend">
                  <Button variant="outline">취소</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "신청 중..." : "신청하기"}
                </Button>
              </CardFooter>
            </form>
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
