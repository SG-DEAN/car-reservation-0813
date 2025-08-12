"use client"

import { useState } from "react"
import { DesktopTimelineView } from "@/components/desktop-timeline-view"
import { MobileTimelineView } from "@/components/mobile-timeline-view"
import { useMobile } from "@/hooks/use-mobile"
import { useToast } from "@/components/ui/use-toast"

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<"day" | "week">("week")
  const isMobile = useMobile()
  const { toast } = useToast()

  // ⭐️ 여기에 테스트 버튼 넣기
  return (
    <div className="container mx-auto p-4">
      {isMobile ? (
        <MobileTimelineView />
      ) : (
        <DesktopTimelineView
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          viewType={viewType}
          onViewTypeChange={setViewType}
        />
      )}
    </div>
  )
}
