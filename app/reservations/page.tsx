"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { CalendarCheck, Car, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { useReservationStore, type Reservation } from "@/services/reservation-service"
import { parseISO } from "date-fns"
import ReservationForm from "@/components/ReservationForm"
import { supabase } from "@/lib/supabaseClient"

export default function ReservationsPage() {
  const { user } = useAuth()
  const { reservations, fetchReservations } = useReservationStore()
  const [userReservations, setUserReservations] = useState<Reservation[]>([])
  const [editReservation, setEditReservation] = useState(null)
  const [showModal, setShowModal] = useState(false)


  // 사용자의 예약만 필터링
  useEffect(() => {
    if (user) {
      let filtered
      if (user.role === "admin") {
        filtered = reservations
      } else {
        filtered = reservations.filter((r) => r.userId === user.id)
      }
      
      setUserReservations(filtered)
    } else {
      setUserReservations([])
    }
  }, [reservations, user])

  // 🔹 Supabase 실시간 구독 추가
  useEffect(() => {
    // 예약 변경 구독
    const channel = supabase
      .channel("reservations-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE 모두
          schema: "public",
          table: "reservations",
        },
        (payload) => {
          console.log("예약 변경 감지됨:", payload)
          fetchReservations() // 예약 목록 다시 불러오기
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel) // 컴포넌트 언마운트 시 해제
    }
  }, [fetchReservations])


  // 현재 날짜 기준으로 예정/완료 예약 분류
  const now = new Date()
  const upcomingReservations = Array.isArray(userReservations)
    ? userReservations.filter((r) => parseISO(r.endTime) > now)
     .filter((r) => parseISO(r.endTime) > now)
     .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())

  const completedReservations = userReservations
    .sort((a, b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime()) // 최근 완료된 순

  // 스토리지 이벤트 리스너 추가
  useEffect(() => {
    // 다른 탭/창에서 스토리지 변경 시 업데이트
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "car-reservations" || e.key === "car-reservations-timestamp") {
        console.log("예약 페이지: 스토리지 변경 감지됨")
        if (user) {
          const filtered = reservations.filter((r) => r.userId === user.id)
          setUserReservations(filtered)
        }
      }
    }

    const handleReservationClick = (reservation) => {
      setEditReservation(reservation)
      setShowModal(true)
    }

    <ReservationCard
      reservation={reservation}
      onClick={() => handleReservationClick(reservation)}
    />

    // 같은 탭 내에서의 변경 감지를 위한 커스텀 이벤트 리스너
    const handleCustomStorageChange = () => {
      console.log("예약 페이지: 커스텀 스토리지 변경 감지됨")
      if (user) {
        const filtered = reservations.filter((r) => r.userId === user.id)
        setUserReservations(filtered)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("car-reservations-updated", handleCustomStorageChange)

    // 초기 로드 시 한 번 강제 업데이트
    if (user) {
      const filtered = reservations.filter((r) => r.userId === user.id)
      setUserReservations(filtered)
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("car-reservations-updated", handleCustomStorageChange)
    }
  }, [reservations, user])

  // 차량 이미지 매핑
  const carImages: Record<string, string> = {
    "1": "https://i.ibb.co/364VRLW/223-9561.jpg", // 카니발
    "2": "https://i.ibb.co/dwBYHBm/49-8181.jpg", // 아이오닉
    "3": "https://i.ibb.co/dwBYHBm/49-8181.jpg", // 아이오닉
    "4": "https://i.ibb.co/wrds2Lz/223-7447-removebg-preview.png", // 스포티지
    "5": "https://i.ibb.co/TDbzLyZ/34-8200-removebg-preview-1.png", // 레이
    "6": "https://i.ibb.co/PskH9RG/191-6774.jpg", // 그랜저
    "7": "https://i.ibb.co/PskH9RG/191-6774.jpg", // 그랜저
  }

  // 차량 이름 매핑
  const carNames: Record<string, string> = {
    "1": "카니발 (223허 9561)",
    "2": "아이오닉 (49호 8181)",
    "3": "아이오닉 (31호 7136)",
    "4": "스포티지 (223하 7447)",
    "5": "레이 (34나 8200)",
    "6": "그랜저 (191호 6774)",
    "7": "그랜저 (191허 1381)",
  }

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 bg-gray-50">
          <div className="container px-4 py-8 md:px-6 md:py-12">
            <Card className="max-w-md mx-auto">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Car className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">로그인이 필요합니다</h3>
                <p className="text-gray-500 mb-6 text-center">예약 내역을 확인하려면 먼저 로그인해주세요.</p>
                <Button className="bg-blue-600 hover:bg-blue-700">로그인하기</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-gray-50">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">내 예약</h1>
            <p className="text-gray-500 mt-1">차량 예약을 관리하세요</p>
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-6 bg-white">
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                예정된 예약 ({upcomingReservations.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                완료된 예약 ({completedReservations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              {upcomingReservations.length === 0 ? (
                <Card className="bg-white">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Car className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium mb-2">예정된 예약이 없습니다</h3>
                    <p className="text-gray-500 mb-6 text-center">예정된 차량 예약이 없습니다.</p>
                    <Link href="/">
                      <Button className="bg-blue-600 hover:bg-blue-700">차량 둘러보기</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                upcomingReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={{
                      ...reservation,
                      carName: carNames[reservation.carId] || `차량 ${reservation.carId}`,
                      carImage: carImages[reservation.carId] || "/placeholder.svg",
                      location: "본사",
                    }}
                    onClick={() => {
                      console.log('카드 클릭!', reservation);
                      setEditReservation(reservation)
                      setShowModal(true)
                    }}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              {completedReservations.length === 0 ? (
                <Card className="bg-white">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Car className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium mb-2">완료된 예약이 없습니다</h3>
                    <p className="text-gray-500 mb-6 text-center">완료된 차량 예약이 없습니다.</p>
                    <Link href="/">
                      <Button className="bg-blue-600 hover:bg-blue-700">차량 둘러보기</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                completedReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={{
                      ...reservation,
                      carName: carNames[reservation.carId] || `차량 ${reservation.carId}`,
                      carImage: carImages[reservation.carId] || "/placeholder.svg",
                      location: "본사",
                    }}
                    onClick={() => {
                      setEditReservation(reservation)
                      setShowModal(true)
                    }}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      {showModal && (
       <ReservationForm
          mode="edit"
          reservation={editReservation}
          onClose={() => setShowModal(false)}
        // onSave, onDelete 등 콜백 연결
       />
      )}      
      <footer className="w-full border-t py-6 bg-white">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row">
          <p className="text-sm text-gray-500">© 2023 SG 법인차량 예약 서비스. 모든 권리 보유.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline text-blue-600" href="#">
              서비스 이용약관
            </Link>
            <Link className="text-sm font-medium hover:underline text-blue-600" href="#">
              개인정보 처리방침
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

interface ReservationCardProps {
  reservation: {
    id: string
    carId: string
    userId: string
    userName: string
    userDepartment: string
    startTime: string
    endTime: string
    carName: string
    carImage: string
    location: string
    purpose?: string
    destination?: string
    isDirect?: boolean
    passengers?: string[]
  }
  onClick?: () => void
}

function ReservationCard({ reservation, onClick }: ReservationCardProps) {
  if (!reservation) return null;
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-0 cursor-pointer" onClick={onClick}>
        <div className="flex flex-col md:flex-row">
          <div className="relative h-40 w-full md:h-auto md:w-48 shrink-0">
            <Image
              src={reservation.carImage || "/placeholder.svg"}
              alt={reservation.carName}
              fill
              className="object-cover md:rounded-l-lg"
            />
          </div>
          <div className="flex flex-1 flex-col p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="mb-1 text-gray-900">{reservation.carName}</CardTitle>
                <CardDescription className="text-blue-600">{reservation.location}</CardDescription>
              </div>
              <div className="mt-2 md:mt-0 md:text-right">
                <div className="text-sm font-medium text-muted-foreground">예약 ID</div>
                <div className="font-medium text-blue-600">{reservation.id}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">예약 일시</div>
                <div className="flex items-center gap-1">
                  <CalendarCheck className="h-4 w-4 text-blue-500" />
                  {formatDateTime(reservation.startTime)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">반납 일시</div>
                <div className="flex items-center gap-1">
                  <CalendarCheck className="h-4 w-4 text-blue-500" />
                  {formatDateTime(reservation.endTime)}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <Link href={`/reservations/${reservation.id}`}>
                <Button variant="ghost" className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  상세 보기 <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
