"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// 차량 타입 정의
interface Car {
  id: string
  name: string
  image: string
  type: string
  seats: number
  location: string
  available: boolean
  description?: string
  features?: string[]
}

export default function CarsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [cars, setCars] = useState<Car[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    type: "sedan",
    seats: "5",
    location: "본사",
    available: true,
    description: "",
    features: "",
  })

  // 관리자가 아니면 홈으로 리다이렉트
  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/")
      return
    }

    // 실제 구현에서는 API에서 차량 목록을 가져옴
    // 여기서는 샘플 데이터 사용
    const sampleCars: Car[] = [
      {
        id: "1",
        name: "카니발 (223허 9561)",
        image: "https://i.ibb.co/QFt1WDwL/223-9561-removebg-preview.png",
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
        image: "https://i.ibb.co/bMdkXZg3/31-7136-removebg-preview.png",
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
        image: "https://i.ibb.co/bMdkXZg3/31-7136-removebg-preview.png",
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
        image: "https://i.ibb.co/wrds2Lz5/223-7447-removebg-preview.png",
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
        image: "https://i.ibb.co/TDbzLyZk/34-8200-removebg-preview-1.png",
        type: "경차",
        seats: 4,
        location: "본사",
        available: true,
        description:
          "기아 레이는 컴팩트한 크기와 높은 연비를 자랑하는 경차입니다. 좁은 도로와 주차 공간이 제한된 도심 환경에서 특히 유용합니다.",
        features: ["높은 연비", "컴팩트한 크기", "넓은 실내 공간", "후방 카메라", "블루투스 연결"],
      },
    ]

    setCars(sampleCars)
    setIsLoading(false)
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleAddCar = () => {
    setEditingCar(null)
    setFormData({
      name: "",
      image: "",
      type: "sedan",
      seats: "5",
      location: "본사",
      available: true,
      description: "",
      features: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditCar = (car: Car) => {
    setEditingCar(car)
    setFormData({
      name: car.name,
      image: car.image,
      type: car.type,
      seats: car.seats.toString(),
      location: car.location,
      available: car.available,
      description: car.description || "",
      features: car.features ? car.features.join(", ") : "",
    })
    setIsDialogOpen(true)
  }

  const handleDeleteCar = (carId: string) => {
    // 실제 구현에서는 API 호출로 차량 삭제
    setCars((prev) => prev.filter((car) => car.id !== carId))
    toast({
      title: "차량 삭제 완료",
      description: "차량이 성공적으로 삭제되었습니다.",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.image) {
      toast({
        title: "입력 오류",
        description: "차량 이름과 이미지 URL은 필수 입력 항목입니다.",
        variant: "destructive",
      })
      return
    }

    // 실제 구현에서는 API 호출로 차량 추가/수정
    const featuresArray = formData.features ? formData.features.split(",").map((feature) => feature.trim()) : []

    if (editingCar) {
      // 차량 수정
      setCars((prev) =>
        prev.map((car) =>
          car.id === editingCar.id
            ? {
                ...car,
                name: formData.name,
                image: formData.image,
                type: formData.type,
                seats: Number.parseInt(formData.seats),
                location: formData.location,
                available: formData.available,
                description: formData.description,
                features: featuresArray,
              }
            : car,
        ),
      )
      toast({
        title: "차량 수정 완료",
        description: "차량 정보가 성공적으로 수정되었습니다.",
      })
    } else {
      // 새 차량 추가
      const newCar: Car = {
        id: Math.random().toString(36).substring(2),
        name: formData.name,
        image: formData.image,
        type: formData.type,
        seats: Number.parseInt(formData.seats),
        location: formData.location,
        available: formData.available,
        description: formData.description,
        features: featuresArray,
      }
      setCars((prev) => [...prev, newCar])
      toast({
        title: "차량 추가 완료",
        description: "새 차량이 성공적으로 추가되었습니다.",
      })
    }

    setIsDialogOpen(false)
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="mb-6">
            <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
              <ChevronLeft className="mr-1 h-4 w-4" />
              관리자 페이지로 돌아가기
            </Link>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">차량 관리</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddCar} className="gap-1">
                  <Plus className="h-4 w-4" /> 차량 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingCar ? "차량 수정" : "새 차량 추가"}</DialogTitle>
                  <DialogDescription>
                    {editingCar ? "차량 정보를 수정하세요." : "새 차량 정보를 입력하세요."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">차량 이름</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="예: 카니발 (223허 9561)"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">이미지 URL</Label>
                      <Input
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">차량 유형</Label>
                        <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                          <SelectTrigger id="type">
                            <SelectValue placeholder="차량 유형 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sedan">세단</SelectItem>
                            <SelectItem value="SUV">SUV</SelectItem>
                            <SelectItem value="전기차">전기차</SelectItem>
                            <SelectItem value="경차">경차</SelectItem>
                            <SelectItem value="하이브리드">하이브리드</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seats">좌석 수</Label>
                        <Select value={formData.seats} onValueChange={(value) => handleSelectChange("seats", value)}>
                          <SelectTrigger id="seats">
                            <SelectValue placeholder="좌석 수 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="7">7</SelectItem>
                            <SelectItem value="9">9</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">위치</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="예: 본사"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">설명</Label>
                      <Input
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="차량에 대한 설명"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="features">기능 (쉼표로 구분)</Label>
                      <Input
                        id="features"
                        name="features"
                        value={formData.features}
                        onChange={handleInputChange}
                        placeholder="예: 후방 카메라, 블루투스, 네비게이션"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="available"
                        checked={formData.available}
                        onChange={(e) => handleCheckboxChange("available", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="available">이용 가능</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingCar ? "수정" : "추가"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>차량 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">로딩 중...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이미지</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead>좌석</TableHead>
                      <TableHead>위치</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cars.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell>
                          <div className="relative h-10 w-16">
                            <Image
                              src={car.image || "/placeholder.svg"}
                              alt={car.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{car.name}</TableCell>
                        <TableCell>{car.type}</TableCell>
                        <TableCell>{car.seats}</TableCell>
                        <TableCell>{car.location}</TableCell>
                        <TableCell>
                          <Badge
                            variant={car.available ? "default" : "secondary"}
                            className={car.available ? "bg-blue-500 hover:bg-blue-600" : ""}
                          >
                            {car.available ? "이용 가능" : "이용 불가"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditCar(car)} title="수정">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="삭제">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>차량 삭제</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    정말로 이 차량을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>취소</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteCar(car.id)}>삭제</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row">
          <p className="text-sm text-gray-500">© 2023 SG 법인차량 예약 서비스. 모든 권리 보유.</p>
        </div>
      </footer>
    </div>
  )
}
