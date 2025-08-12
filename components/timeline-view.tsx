"use client"

import { useMobile } from "@/hooks/use-mobile"
import { MobileTimelineView } from "@/components/mobile-timeline-view"
import { DesktopTimelineView } from "@/components/desktop-timeline-view"

export function TimelineView() {
  const isMobile = useMobile()

  return isMobile ? <MobileTimelineView /> : <DesktopTimelineView />
}
