"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

export function MobileSearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL 파라미터에서 초기값 가져오기
  const initialReservationDate = searchParams.get("reservationDate")
    ? new Date(searchParams.get("reservationDate") as string)
    : undefined

  const initialReturnDate = searchParams.get("returnDate")
    ? new Date(searchParams.get("returnDate") as string)
    : undefined

  const initialReservationTime = searchParams.get("reservationTime") || "08:00"
  const initialReturnTime = searchParams.get("returnTime") || "08:00"
  const initialCarType = searchParams.get("carType") || "all"
  const initialSeats = searchParams.get("seats") || "all"

  // Initialize all state variables
  const [reservationPopoverOpen, setReservationPopoverOpen] = useState(false)
  const [returnPopoverOpen, setReturnPopoverOpen] = useState(false)
  const [reservationDate, setReservationDate] = useState<Date | undefined>(initialReservationDate)
  const [returnDate, setReturnDate] = useState<Date | undefined>(initialReturnDate)
  const [reservationTime, setReservationTime] = useState<string>(initialReservationTime)
  const [returnTime, setReturnTime] = useState<string>(initialReturnTime)
  const [carType, setCarType] = useState<string>(initialCarType)
  const [seats, setSeats] = useState<string>(initialSeats)

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

  const combineDateTime = (date: Date | undefined, timeString: string) => {
    if (!date) return undefined

    const [hours, minutes] = timeString.split(":").map(Number)
    const newDate = new Date(date)
    newDate.setHours(hours, minutes, 0, 0)
    return newDate
  }

  // 날짜 선택 핸들러 - 자동으로 팝업 닫기
  const handleReservationDateSelect = (date: Date | undefined) => {
    if (date) {
      setReservationDate(date)
      // Set return date to same day by default if not already set
      if (!returnDate || returnDate < date) {
        setReturnDate(date)
      }
      // 자동으로 팝업 닫기
      setReservationPopoverOpen(false)
    }
  }

  const handleReturnDateSelect = (date: Date | undefined) => {
    if (date) {
      setReturnDate(date)
      // 자동으로 팝업 닫기
      setReturnPopoverOpen(false)
    }
  }

  const handleSearch = () => {
    const reservationDateTime = combineDateTime(reservationDate, reservationTime)
    const returnDateTime = combineDateTime(returnDate, returnTime)

    // 검색 파라미터 구성
    const params = new URLSearchParams()

    if (reservationDate) {
      params.set("reservationDate", reservationDate.toISOString())
      params.set("reservationTime", reservationTime)
    }

    if (returnDate) {
      params.set("returnDate", returnDate.toISOString())
      params.set("returnTime", returnTime)
    }

    if (carType !== "all") {
      params.set("carType", carType)
    }

    if (seats !== "all") {
      params.set("seats", seats)
    }

    // 현재 페이지에서 검색 파라미터 업데이트
    router.push(`/?${params.toString()}`)
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="reservation-date">예약 일시</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover open={reservationPopoverOpen} onOpenChange={setReservationPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reservationDate ? format(reservationDate, "yyyy-MM-dd") : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={reservationDate}
                    onSelect={handleReservationDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Select value={reservationTime} onValueChange={setReservationTime}>
                <SelectTrigger id="reservation-time">
                  <SelectValue placeholder="시간 선택" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="return-date">반납 일시</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover open={returnPopoverOpen} onOpenChange={setReturnPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate ? format(returnDate, "yyyy-MM-dd") : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={handleReturnDateSelect}
                    disabled={(date) => {
                      // Disable dates before the reservation date
                      if (!reservationDate) return false
                      return date < reservationDate
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Select value={returnTime} onValueChange={setReturnTime}>
                <SelectTrigger id="return-time">
                  <SelectValue placeholder="시간 선택" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="car-type">차량 유형</Label>
              <Select value={carType} onValueChange={setCarType}>
                <SelectTrigger id="car-type">
                  <SelectValue placeholder="차량 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 유형</SelectItem>
                  <SelectItem value="sedan">세단</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="electric">전기차</SelectItem>
                  <SelectItem value="hybrid">하이브리드</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seats">좌석</Label>
              <Select value={seats} onValueChange={setSeats}>
                <SelectTrigger id="seats">
                  <SelectValue placeholder="좌석 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모두</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                  <SelectItem value="7">7+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full" onClick={handleSearch}>
            검색
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
