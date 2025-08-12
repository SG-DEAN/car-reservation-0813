"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CalendarIcon, Plus, X } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useReservationStore } from "@/services/reservation-service"
import { supabase } from "@/lib/supabaseClient"

interface ReservationFormProps {
  carId: string
  carName: string
}

// 샘플 사용자 데이터
const sampleUsers = [
  { id: "1", name: "관리자", department: "관리부", team: "관리팀" },
  { id: "2", name: "홍길동", department: "영업부", team: "영업1팀" },
  { id: "3", name: "김철수", department: "개발부", team: "개발1팀" },
  { id: "4", name: "이영희", department: "영업부", team: "영업2팀" },
  { id: "5", name: "박지성", department: "개발부", team: "개발2팀" },
  { id: "6", name: "손흥민", department: "마케팅부", team: "마케팅팀" },
  { id: "7", name: "김민재", department: "디자인부", team: "디자인팀" },
  { id: "8", name: "황희찬", department: "인사부", team: "인사팀" },
  { id: "9", name: "김민수", department: "영업부", team: "영업3팀" },
  { id: "10", name: "김지원", department: "개발부", team: "개발3팀" },
]

// 팀별로 그룹화
const groupedUsers = sampleUsers.reduce(
  (acc, user) => {
    if (!acc[user.team]) {
      acc[user.team] = []
    }
    acc[user.team].push(user)
    return acc
  },
  {} as Record<string, typeof sampleUsers>,
)

// 샘플 예약 데이터 (중복 예약 체크용)
const existingReservations = [
  {
    carId: "1",
    startTime: new Date("2025-04-10T10:00:00"),
    endTime: new Date("2025-04-10T14:00:00"),
    userName: "김철수",
  },
  {
    carId: "2",
    startTime: new Date("2025-04-11T09:00:00"),
    endTime: new Date("2025-04-11T12:00:00"),
    userName: "홍길동",
  },
]

export function ReservationForm({ carId, carName }: ReservationFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const { addReservation } = useReservationStore()

  // Popover 상태 관리를 위한 ref
  const pickupPopoverRef = useRef<HTMLButtonElement>(null)
  const returnPopoverRef = useRef<HTMLButtonElement>(null)

  // URL 파라미터에서 초기값 가져오기
  const initialPickupDate = searchParams.get("reservationDate")
    ? new Date(searchParams.get("reservationDate") as string)
    : undefined

  const initialReturnDate = searchParams.get("returnDate")
    ? new Date(searchParams.get("returnDate") as string)
    : undefined

  const initialPickupTime = searchParams.get("reservationTime") || "08:00"
  const initialReturnTime = searchParams.get("returnTime") || "08:00"

  const [pickupDate, setPickupDate] = useState<Date | undefined>(initialPickupDate)
  const [returnDate, setReturnDate] = useState<Date | undefined>(initialReturnDate)
  const [pickupTime, setPickupTime] = useState<string>(initialPickupTime)
  const [returnTime, setReturnTime] = useState<string>(initialReturnTime)
  const [purpose, setPurpose] = useState<string>("")
  const [destination, setDestination] = useState<string>("")
  const [isDirect, setIsDirect] = useState<boolean>(false)
  const [passengers, setPassengers] = useState<typeof sampleUsers>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filteredUsers, setFilteredUsers] = useState<typeof sampleUsers>([])
  const [isPassengerDialogOpen, setIsPassengerDialogOpen] = useState<boolean>(false)
  const [isDuplicateAlertOpen, setIsDuplicateAlertOpen] = useState<boolean>(false)
  const [duplicateInfo, setDuplicateInfo] = useState<{ userName: string; time: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false) // 제출 중 상태 추가

  // Popover 상태
  const [pickupPopoverOpen, setPickupPopoverOpen] = useState(false)
  const [returnPopoverOpen, setReturnPopoverOpen] = useState(false)

  // 검색어에 따라 사용자 필터링 - 이름 또는 팀명으로 검색 가능하도록 수정
  useEffect(() => {
    // 검색어가 없을 때도 모든 사용자 표시 (이미 선택된 사용자와 현재 사용자 제외)
    const availableUsers = sampleUsers.filter((u) => !passengers.some((p) => p.id === u.id) && u.id !== user?.id)

    if (searchTerm.trim() === "") {
      setFilteredUsers(availableUsers)
      return
    }

    const searchTermLower = searchTerm.toLowerCase()
    const filtered = availableUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTermLower) ||
        u.team.toLowerCase().includes(searchTermLower) ||
        u.department.toLowerCase().includes(searchTermLower),
    )
    setFilteredUsers(filtered)
  }, [searchTerm, passengers, user])

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

  // 중복 예약 체크 함수
  const checkDuplicateReservation = (startTime: Date, endTime: Date) => {
    for (const reservation of existingReservations) {
      if (reservation.carId === carId) {
        const reservationStart = reservation.startTime
        const reservationEnd = reservation.endTime

        // 시간 겹침 체크
        if (
          (startTime >= reservationStart && startTime < reservationEnd) ||
          (endTime > reservationStart && endTime <= reservationEnd) ||
          (startTime <= reservationStart && endTime >= reservationEnd)
        ) {
          return {
            isDuplicate: true,
            userName: reservation.userName,
            time: `${format(reservationStart, "yyyy-MM-dd HH:mm")} ~ ${format(reservationEnd, "HH:mm")}`,
          }
        }
      }
    }
    return { isDuplicate: false }
  }

  const handleAddPassenger = () => {
    // 다이얼로그 열 때 모든 사용자 목록 표시 (이미 선택된 사용자와 현재 사용자 제외)
    const allAvailableUsers = sampleUsers.filter((u) => !passengers.some((p) => p.id === u.id) && u.id !== user?.id)
    setFilteredUsers(allAvailableUsers)
    setSearchTerm("")
    setIsPassengerDialogOpen(true)
  }

  const handleRemovePassenger = (userId: string) => {
    setPassengers(passengers.filter((p) => p.id !== userId))

    // 사용자 목록 업데이트
    const availableUsers = sampleUsers.filter(
      (u) => !passengers.some((p) => p.id === u.id && p.id !== userId) && u.id !== user?.id,
    )

    if (searchTerm.trim() === "") {
      setFilteredUsers(availableUsers)
    } else {
      const searchTermLower = searchTerm.toLowerCase()
      const filtered = availableUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTermLower) ||
          u.team.toLowerCase().includes(searchTermLower) ||
          u.department.toLowerCase().includes(searchTermLower),
      )
      setFilteredUsers(filtered)
    }
  }

  // 동승자 선택 시 검색창이 닫히지 않도록 수정
  const handleSelectPassenger = (userId: string) => {
    const selectedUser = sampleUsers.find((u) => u.id === userId)
    if (selectedUser && !passengers.some((p) => p.id === userId)) {
      setPassengers([...passengers, selectedUser])

      // 선택한 사용자를 필터링된 목록에서 제거
      setFilteredUsers(filteredUsers.filter((u) => u.id !== userId))
    }
  }

  // 날짜 선택 핸들러 - 자동으로 팝업 닫기
  const handlePickupDateSelect = (date: Date | undefined) => {
    if (date) {
      setPickupDate(date)
      // Set return date to same day by default if not already set
      if (!returnDate || returnDate < date) {
        setReturnDate(date)
      }
      // 자동으로 팝업 닫기
      setPickupPopoverOpen(false)
    }
  }

  const handleReturnDateSelect = (date: Date | undefined) => {
    if (date) {
      setReturnDate(date)
      // 자동으로 팝업 닫기
      setReturnPopoverOpen(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[예약] submit clicked")

    if (isSubmitting) return // 이미 제출 중이면 중복 제출 방지

    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "차량을 예약하려면 먼저 로그인해주세요.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!pickupDate || !returnDate) {
      toast({
        title: "날짜 선택 필요",
        description: "예약 일시와 반납 일시를 모두 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!purpose) {
      toast({
        title: "이용 목적 필요",
        description: "이용 목적을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    const pickupDateTime = combineDateTime(pickupDate, pickupTime)
    const returnDateTime = combineDateTime(returnDate, returnTime)

    if (!pickupDateTime || !returnDateTime) {
      return
    }

    console.log("[예약] duplicate check pass", { pickupDateTime, returnDateTime })

    // 중복 예약 체크
 // const duplicateCheck = checkDuplicateReservation(pickupDateTime, returnDateTime)
 //   if (duplicateCheck.isDuplicate) {
 //    setDuplicateInfo({
 //       userName: duplicateCheck.userName,
 //       time: duplicateCheck.time,
 //     })
 //     setIsDuplicateAlertOpen(true)
 //     return
 //   }

    // 제출 중 상태로 변경
    setIsSubmitting(true)

    try {
      if (!user?.id) {
        throw new Error("로그인이 필요합니다.")
      }
      if (!carId || !pickupDateTime || !returnDateTime) {
        throw new Error("필수 값이 누락되었습니다.")
      }

      const payload = {
        user_id: user.id,
        car_id: carId,
        start_time: pickupDateTime.toISOString(),
        end_time: returnDateTime.toISOString(),
        purpose,
        destination,
        is_direct: !!isDirect,
        passengers: (passengers ?? []).map((p) => p.id),
      }

      // 2) Supabase insert
      console.log("[예약] will insert payload:", payload)
      const { data, error } = await supabase
        .from("reservations")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error("[예약] insert error:", error)
        throw error
      }

        addReservation({
          id: data.id,
          carId: data.car_id,
          userId: data.user_id,
          userName: user.name ?? "",
          userDepartment: user.department ?? "",
          startTime: data.start_time,
          endTime: data.end_time,
          purpose: data.purpose,
          destination: data.destination,
          isDirect: data.is_direct,
          passengers: Array.isArray(data.passengers) ? data.passengers : [],
          createdAt: data.created_at,
        })

      const passengerIds = (passengers ?? []).map((p) => p.id).join(",")
      router.push(
        `/reservations/confirmation?carId=${carId}` +
          `&pickupDate=${encodeURIComponent(pickupDateTime.toISOString())}` +
          `&returnDate=${encodeURIComponent(returnDateTime.toISOString())}` +
          `&userName=${encodeURIComponent(user.name ?? "")}` +
          `&userDepartment=${encodeURIComponent(user.department ?? "")}` +
          `&purpose=${encodeURIComponent(purpose ?? "")}` +
          `&destination=${encodeURIComponent(destination ?? "")}` +
          `&isDirect=${isDirect}` +
          `&passengers=${encodeURIComponent(passengerIds)}`
      )
    } catch (error) {
      console.error(error)
      toast({
        title: "예약 실패",
        description: (error as Error).message || "예약 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false) // ← 성공/실패 모두 해제
    }
    }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">예약 일시</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover open={pickupPopoverOpen} onOpenChange={setPickupPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    ref={pickupPopoverRef}
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {pickupDate ? format(pickupDate, "yyyy-MM-dd") : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={pickupDate} onSelect={handlePickupDateSelect} initialFocus />
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
              <Popover open={returnPopoverOpen} onOpenChange={setReturnPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    ref={returnPopoverRef}
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
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
                      // 예약 날짜 이전 날짜만 비활성화
                      if (!pickupDate) return false
                      return date < pickupDate
                    }}
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

          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-sm font-medium">
              이용 목적
            </Label>
            <Textarea
              id="purpose"
              placeholder="이용 목적을 입력하세요"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
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
              placeholder="방문할 장소나 지역을 입력하세요. ex) 용인/SG"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="isDirect" checked={isDirect} onCheckedChange={(checked) => setIsDirect(!!checked)} />
            <Label htmlFor="isDirect" className="text-sm font-medium">
              직출/직퇴 여부
            </Label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">동승자</Label>
              <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleAddPassenger}>
                <Plus className="h-3.5 w-3.5" />
                동승자 추가
              </Button>
            </div>
            <div className="rounded-md border p-2 min-h-[80px]">
              {passengers.length === 0 ? (
                <div className="text-sm text-gray-500 h-full flex items-center justify-center">
                  동승자가 없습니다. 동승자를 추가하려면 위 버튼을 클릭하세요.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {passengers.map((passenger) => (
                    <Badge key={passenger.id} variant="secondary" className="gap-1 pl-2">
                      {passenger.name} ({passenger.team})
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full"
                        onClick={() => handleRemovePassenger(passenger.id)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "예약 처리 중..." : "예약하기"}
          </Button>
        </div>
      </form>

      {/* 동승자 선택 다이얼로그 */}
      <Dialog open={isPassengerDialogOpen} onOpenChange={setIsPassengerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>동승자 추가</DialogTitle>
            <DialogDescription>
              함께 탑승할 동승자를 선택하세요. 이름, 부서, 팀명으로 검색 가능합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="이름, 부서 또는 팀명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
              autoComplete="off"
            />

            <div className="border rounded-md max-h-60 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">검색 결과가 없습니다.</div>
              ) : (
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      onClick={() => handleSelectPassenger(user.id)}
                    >
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          {user.department} / {user.team}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8">
                        추가
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 추가된 동승자 목록 표시 */}
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">추가된 동승자</h3>
              {passengers.length === 0 ? (
                <div className="text-sm text-gray-500 p-2 border rounded-md">추가된 동승자가 없습니다.</div>
              ) : (
                <div className="border rounded-md p-2">
                  <div className="flex flex-wrap gap-2">
                    {passengers.map((passenger) => (
                      <Badge key={passenger.id} variant="secondary" className="gap-1 pl-2">
                        {passenger.name} ({passenger.team})
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemovePassenger(passenger.id)
                          }}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPassengerDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDuplicateAlertOpen} onOpenChange={setIsDuplicateAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약 불가</AlertDialogTitle>
            <AlertDialogDescription>
              해당 시간은 이미 예약되었습니다. 이용 시간 변경 또는 다른 차량 예약 바랍니다.
              <br />
              <br />
              <span className="font-medium">
                {duplicateInfo?.userName}, {duplicateInfo?.time}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
