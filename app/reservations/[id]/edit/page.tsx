"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { useToast } from "@/components/ui/use-toast"

interface EditReservationPageProps {
  params: {
    id: string
  }
}

export default function EditReservationPage({ params }: EditReservationPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 실제 구현에서는 API에서 예약 정보를 가져옴
  // 여기서는 샘플 데이터 사용
  const reservation = {
    id: params.id,
    carId: "1",
    carName: "카니발 (223허 9561)",
    userName: "홍길동",
    userDepartment: "영업부",
    pickupDate: "2025-04-08T09:00:00",
    returnDate: "2025-04-08T13:00:00",
  }

  const initialPickupDate = new Date(reservation.pickupDate)
  const initialReturnDate = new Date(reservation.returnDate)

  const initialPickupTime = format(initialPickupDate, "HH:mm")
  const initialReturnTime = format(initialReturnDate, "HH:mm")

  const [pickupDate, setPickupDate] = useState<Date>(initialPickupDate)
  const [returnDate, setReturnDate] = useState<Date>(initialReturnDate)
  const [pickupTime, setPickupTime] = useState<string>(initialPickupTime)
  const [returnTime, setReturnTime] = useState<string>(initialReturnTime)

  // Generate time options in 15-minute intervals from 08:00 to 18:00
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Skip 18:15, 18:30, 18:45
        if (hour === 18 && minute > 0) continue

        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        options.push(`${formattedHour}:${formattedMinute}`)
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  const combineDateTime = (date: Date, timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    const newDate = new Date(date)
    newDate.setHours(hours, minutes, 0, 0)
    return newDate
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const updatedPickupDateTime = combineDateTime(pickupDate, pickupTime)
    const updatedReturnDateTime = combineDateTime(returnDate, returnTime)

    // 실제 구현에서는 API 호출로 예약 업데이트
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "예약이 수정되었습니다",
        description: "예약이 성공적으로 수정되었습니다.",
      })
      router.push(`/reservations/${params.id}`)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="mb-6">
            <Link
              href={`/reservations/${params.id}`}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              예약 상세로 돌아가기
            </Link>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>예약 수정</CardTitle>
              <CardDescription>예약 번호: {params.id}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>차량</Label>
                  <div className="text-sm p-2 border rounded-md bg-gray-50">{reservation.carName}</div>
                </div>

                <div className="space-y-1">
                  <Label>예약자</Label>
                  <div className="text-sm p-2 border rounded-md bg-gray-50">
                    {reservation.userName} ({reservation.userDepartment})
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">예약 일시</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(pickupDate, "yyyy-MM-dd")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={pickupDate}
                          onSelect={(date) => {
                            if (date) {
                              setPickupDate(date)
                              // Set return date to same day by default if return date is before pickup date
                              if (returnDate < date) {
                                setReturnDate(date)
                              }
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Select value={pickupTime} onValueChange={setPickupTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="시간 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={`pickup-${time}`} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">반납 일시</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(returnDate, "yyyy-MM-dd")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={returnDate}
                          onSelect={(date) => date && setReturnDate(date)}
                          disabled={(date) => date < pickupDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Select value={returnTime} onValueChange={setReturnTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="시간 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={`return-${time}`} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/reservations/${params.id}`}>
                  <Button variant="outline">취소</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "저장 중..." : "저장"}
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
