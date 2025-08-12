"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { CalendarCheck, Check, User, MapPin, FileText, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"

// 샘플 사용자 데이터 (동승자 정보 표시용)
const sampleUsers = [
  { id: "1", name: "관리자", department: "관리부", team: "관리팀" },
  { id: "2", name: "홍길동", department: "영업부", team: "영업1팀" },
  { id: "3", name: "김철수", department: "개발부", team: "개발1팀" },
  { id: "4", name: "이영희", department: "영업부", team: "영업2팀" },
  { id: "5", name: "박지성", department: "개발부", team: "개발2팀" },
  { id: "6", name: "손흥민", department: "마케팅부", team: "마케팅팀" },
  { id: "7", name: "김민재", department: "디자인부", team: "디자인팀" },
  { id: "8", name: "황희찬", department: "인사부", team: "인사팀" },
]

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const carId = searchParams.get("carId")
  const pickupDateStr = searchParams.get("pickupDate")
  const returnDateStr = searchParams.get("returnDate")
  const userName = searchParams.get("userName")
  const userDepartment = searchParams.get("userDepartment")
  const purpose = searchParams.get("purpose")
  const destination = searchParams.get("destination")
  const isDirect = searchParams.get("isDirect") === "true"
  const passengersStr = searchParams.get("passengers")

  // 동승자 정보 파싱
  const passengerIds = passengersStr ? passengersStr.split(",") : []
  const passengers = sampleUsers.filter((user) => passengerIds.includes(user.id))

  // 실제 차량 데이터로 업데이트
  const cars = {
    "1": { name: "카니발 (223허 9561)" },
    "2": { name: "아이오닉 (49호 8181)" },
    "3": { name: "아이오닉 (31호 7136)" },
    "4": { name: "스포티지 (223하 7447)" },
    "5": { name: "레이 (34나 8200)" },
    "6": { name: "그랜저 (191호 6774)" },
    "7": { name: "그랜저 (191허 1381)" },
  }

  const car = carId && carId in cars ? cars[carId as keyof typeof cars] : null
  const pickupDate = pickupDateStr ? new Date(pickupDateStr) : null
  const returnDate = returnDateStr ? new Date(returnDateStr) : null

  const reservationNumber = "R" + Math.floor(100000 + Math.random() * 900000)

  if (!car || !pickupDate || !returnDate) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>잘못된 예약</CardTitle>
              <CardDescription>이 예약에 대한 세부 정보를 찾을 수 없습니다.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/" className="w-full">
                <Button className="w-full">홈으로 돌아가기</Button>
              </Link>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">예약이 확정되었습니다!</CardTitle>
            <CardDescription>차량이 성공적으로 예약되었습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="text-sm font-medium text-muted-foreground">예약 번호</div>
              <div className="text-lg font-bold">{reservationNumber}</div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">차량 정보</h3>
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-gray-500" />
                <span>{car.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">예약자 정보</h3>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>
                  {userName} ({userDepartment})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">예약 일시</div>
                <div className="flex items-center gap-1">
                  <CalendarCheck className="h-4 w-4 text-gray-500" />
                  {format(pickupDate, "yyyy-MM-dd HH:mm")}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">반납 일시</div>
                <div className="flex items-center gap-1">
                  <CalendarCheck className="h-4 w-4 text-gray-500" />
                  {format(returnDate, "yyyy-MM-dd HH:mm")}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">이용 목적</h3>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                <span>{purpose}</span>
              </div>
            </div>

            {destination && (
              <div className="space-y-2">
                <h3 className="font-medium">방문지/지역</h3>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{destination}</span>
                </div>
              </div>
            )}

            {isDirect && (
              <div className="rounded-md bg-blue-50 p-2 text-blue-700">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span className="font-medium">직출/직퇴 예정</span>
                </div>
              </div>
            )}

            {passengers.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">동승자 정보</h3>
                <div className="flex flex-wrap gap-2">
                  {passengers.map((passenger) => (
                    <Badge key={passenger.id} variant="secondary">
                      {passenger.name} ({passenger.team})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href="/reservations" className="w-full">
              <Button className="w-full">내 예약 보기</Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                홈으로 돌아가기
              </Button>
            </Link>
          </CardFooter>
        </Card>
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
