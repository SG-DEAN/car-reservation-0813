"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

export function RealtimeStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState<Date>(new Date())

  useEffect(() => {
    // 온라인/오프라인 상태 감지
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // 초기 상태 설정
    setIsOnline(navigator.onLine)

    // 30초마다 동기화 시간 업데이트
    const interval = setInterval(() => {
      setLastSync(new Date())
    }, 30000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {isOnline ? "온라인" : "오프라인"}
      </Badge>
      <span>마지막 동기화: {lastSync.toLocaleTimeString("ko-KR")}</span>
    </div>
  )
}
