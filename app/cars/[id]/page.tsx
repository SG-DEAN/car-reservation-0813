import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Car, MapPin, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { ReservationForm } from "@/components/reservation-form"

interface CarPageProps {
  params: {
    id: string
  }
}

export default function CarPage({ params }: CarPageProps) {
  // 실제 차량 데이터로 업데이트
  const cars = [
    {
      id: "1",
      name: "카니발 (223허 9561)",
      image: "https://i.ibb.co/364VRLW/223-9561.jpg",
      type: "SUV",
      seats: 9,
      location: "본사",
      available: true,
      description:
        "카니발은 기아의 대표적인 미니밴으로, 넓은 실내 공간과 편안한 승차감을 제공합니다. 9인승 모델로 단체 이동에 적합하며, 다양한 편의 기능을 갖추고 있습니다.",
      features: ["9인승", "자동 슬라이딩 도어", "후방 카메라", "스마트 키", "블루투스 연결"],
    },
    {
      id: "2",
      name: "아이오닉 (49호 8181)",
      image: "https://i.ibb.co/dwBYHBm/49-8181.jpg",
      type: "전기차",
      seats: 5,
      location: "본사",
      available: true,
      description:
        "현대 아이오닉은 친환경 전기차로, 제로 배출과 조용한 주행 경험을 제공합니다. 도심 주행에 최적화된 모델로 경제적이고 환경 친화적인 이동 수단입니다.",
      features: ["전기 모터", "급속 충전", "스마트 인포테인먼트 시스템", "차선 유지 보조", "스마트 크루즈 컨트롤"],
    },
    {
      id: "3",
      name: "아이오닉 (31호 7136)",
      image: "https://i.ibb.co/wThd1ZN/31-7136.jpg",
      type: "전기차",
      seats: 5,
      location: "본사",
      available: true,
      description:
        "현대 아이오닉은 친환경 전기차로, 제로 배출과 조용한 주행 경험을 제공합니다. 도심 주행에 최적화된 모델로 경제적이고 환경 친화적인 이동 수단입니다.",
      features: ["전기 모터", "급속 충전", "스마트 인포테인먼트 시스템", "차선 유지 보조", "스마트 크루즈 컨트롤"],
    },
    {
      id: "4",
      name: "스포티지 (223하 7447)",
      image: "https://i.ibb.co/qvy50Lr/223-7447.jpg",
      type: "SUV",
      seats: 5,
      location: "본사",
      available: true,
      description:
        "기아 스포티지는 중형 SUV로, 안정적인 주행 성능과 넓은 적재 공간을 제공합니다. 도심과 교외 주행 모두에 적합한 다재다능한 차량입니다.",
      features: [
        "전방 충돌 방지 보조",
        "차선 이탈 방지 보조",
        "스마트 크루즈 컨트롤",
        "후방 교차 충돌 방지 보조",
        "360도 카메라",
      ],
    },
    {
      id: "5",
      name: "레이 (34나 8200)",
      image: "https://i.ibb.co/v48VMHk/34-8200.jpg",
      type: "경차",
      seats: 4,
      location: "본사",
      available: true,
      description:
        "기아 레이는 컴팩트한 크기와 높은 연비를 자랑하는 경차입니다. 좁은 도로와 주차 공간이 제한된 도심 환경에서 특히 유용합니다.",
      features: ["높은 연비", "컴팩트한 크기", "넓은 실내 공간", "후방 카메라", "블루투스 연결"],
    },
    {
      id: "6",
      name: "그랜저 (191호 6774)",
      image: "https://i.ibb.co/PskH9RG/191-6774.jpg",
      type: "세단",
      seats: 5,
      location: "본사",
      available: true,
      description:
        "현대 그랜저는 고급스러운 인테리어와 부드러운 승차감을 제공하는 대형 세단입니다. 비즈니스 미팅이나 중요한 행사에 적합한 고급 차량입니다.",
      features: ["가죽 시트", "파노라마 선루프", "프리미엄 오디오 시스템", "전동 조절 시트", "스마트 크루즈 컨트롤"],
    },
    {
      id: "7",
      name: "그랜저 (191허 1381)",
      image: "https://i.ibb.co/v663xCk/191-1381.jpg",
      type: "세단",
      seats: 5,
      location: "본사",
      available: true,
      description:
        "현대 그랜저는 고급스러운 인테리어와 부드러운 승차감을 제공하는 대형 세단입니다. 비즈니스 미팅이나 중요한 행사에 적합한 고급 차량입니다.",
      features: ["가죽 시트", "파노라마 선루프", "프리미엄 오디오 시스템", "전동 조절 시트", "스마트 크루즈 컨트롤"],
    },
  ]

  const car = cars.find((car) => car.id === params.id)

  if (!car) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div>
                <Link href="/" className="text-sm text-gray-500 hover:underline">
                  &larr; 차량 목록으로 돌아가기
                </Link>
                <h1 className="mt-2 text-3xl font-bold">{car.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">{car.location}</span>
                  <Badge variant={car.available ? "default" : "secondary"} className="ml-2">
                    {car.available ? "이용 가능" : "이용 불가"}
                  </Badge>
                </div>
              </div>

              <div className="relative aspect-video overflow-hidden rounded-lg">
                <Image src={car.image || "/placeholder.svg"} alt={car.name} fill className="object-cover" />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">이 차량에 대하여</h2>
                <p className="text-gray-700">{car.description}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">기능 및 사양</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-gray-500" />
                    <span>{car.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <span>{car.seats}인승</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <h3 className="font-medium mb-2">포함된 기능</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {car.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">법인 차량 예약</h2>
                  <ReservationForm carId={car.id} carName={car.name} />
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
