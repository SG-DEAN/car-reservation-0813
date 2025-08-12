"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { CalendarCheck, ChevronLeft, Pencil, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
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
import { useToast } from "@/components/ui/use-toast"

interface ReservationDetailPageProps {
  params: {
    id: string
  }
}

export default function ReservationDetailPage({ params }: ReservationDetailPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  // 실제 구현에서는 API에서 예약 정보를 가져옴
  // 여기서는 샘플 데이터 사용
  const reservation = {
    id: params.id,
    carId: "1",
    carName: "카니발 (223허 9561)",
    carImage: "https://i.ibb.co/QFt1WDwL/223-9561-removebg-preview.png",
    userName: "홍길동",
    userDepartment: "영업부",
    pickupDate: "2025-04-08T09:00:00",
    returnDate: "2025-04-08T13:00:00",
    status: "upcoming",
  }

  const handleDelete = () => {
    setIsDeleting(true)

    // 실제 구현에서는 API 호출로 예약 삭제
    setTimeout(() => {
      setIsDeleting(false)
      toast({
        title: "예약이 취소되었습니다",
        description: "예약이 성공적으로 취소되었습니다.",
      })
      router.push("/reservations")
    }, 1000)
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "yyyy년 MM월 dd일 HH:mm")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="mb-6">
            <Link href="/reservations" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
              <ChevronLeft className="mr-1 h-4 w-4" />
              예약 목록으로 돌아가기
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>예약 상세 정보</CardTitle>
                  <CardDescription>예약 번호: {reservation.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative h-48 w-full md:w-64 shrink-0">
                      <Image
                        src={reservation.carImage || "/placeholder.svg"}
                        alt={reservation.carName}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{reservation.carName}</h3>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>
                            {reservation.userName} ({reservation.userDepartment})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="h-4 w-4 text-gray-500" />
                          <span>예약 일시: {formatDateTime(reservation.pickupDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="h-4 w-4 text-gray-500" />
                          <span>반납 일시: {formatDateTime(reservation.returnDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href={`/reservations/${params.id}/edit`}>
                    <Button variant="outline" className="gap-1">
                      <Pencil className="h-4 w-4" /> 예약 수정
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-1">
                        <Trash2 className="h-4 w-4" /> 예약 취소
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>예약을 취소하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                          이 작업은 되돌릴 수 없습니다. 예약이 영구적으로 삭제됩니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                          {isDeleting ? "취소 중..." : "예약 취소"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>이용 안내</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">차량 이용 시간</h4>
                    <p className="text-sm text-gray-500">08:00 ~ 18:00</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">차량 이용 규칙</h4>
                    <ul className="text-sm text-gray-500 space-y-1 list-disc pl-4">
                      <li>차량 반납 시 연료는 최소 절반 이상 채워주세요.</li>
                      <li>차량 내부 청결을 유지해주세요.</li>
                      <li>차량 이용 후 열쇠는 관리실에 반납해주세요.</li>
                      <li>사고 발생 시 즉시 관리자에게 연락해주세요.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">문의 연락처</h4>
                    <p className="text-sm text-gray-500">관리자: 010-1234-5678</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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
