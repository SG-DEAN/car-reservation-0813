"use client"

import Image from "next/image"
import { Car, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { LoginDialog } from "@/components/login-dialog"
import { useState } from "react"

interface CarCardProps {
  car: {
    id: string
    name: string
    image: string
    type: string
    seats: number
    location: string
    available: boolean
  }
}

export function CarCard({ car }: CarCardProps) {
  const searchParams = useSearchParams()
  const availableCars = searchParams.get("availableCars")?.split(",") || []
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)

  // 검색 조건이 있고, 해당 차량이 가용 차량 목록에 없는 경우 이용 불가로 표시
  const isAvailable = !availableCars.length || availableCars.includes(car.id)

  const handleReservationClick = () => {
    if (!user) {
      // Instead of redirecting to login page, open the login dialog
      setIsLoginDialogOpen(true)
      return
    }

    router.push(`/cars/${car.id}`)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image src={car.image || "/placeholder.svg"} alt={car.name} fill className="object-cover" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{car.name}</h3>
            <p className="text-sm text-gray-500">{car.location}</p>
          </div>
          <Badge
            variant={isAvailable ? "default" : "destructive"}
            className={isAvailable ? "bg-blue-500 hover:bg-blue-600" : ""}
          >
            {isAvailable ? "이용 가능" : "이용 불가"}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="flex items-center gap-1 text-sm">
            <Car className="h-4 w-4" />
            <span>{car.type}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-4 w-4" />
            <span>{car.seats} seats</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end items-center p-4 pt-0">
        <Button onClick={handleReservationClick} disabled={!isAvailable}>
          예약하기
        </Button>
      </CardFooter>
      {/* Login Dialog */}
      <LoginDialog externalOpen={isLoginDialogOpen} onExternalOpenChange={setIsLoginDialogOpen} />
    </Card>
  )
}
