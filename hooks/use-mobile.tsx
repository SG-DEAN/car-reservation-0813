"use client"

import { useState, useEffect } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 초기 로드 시 확인
    checkIfMobile()

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener("resize", checkIfMobile)

    // 컴포넌트 언마운트 시 리스너 제거
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  function checkIfMobile() {
    setIsMobile(window.innerWidth < 768)
  }

  return isMobile
}

export const useMobile = useIsMobile
