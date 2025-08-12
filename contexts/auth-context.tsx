"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabaseClient"

// 사용자 타입 정의
export interface User {
  id: string
  name: string
  email: string
  department: string
  role: "admin" | "user"
}

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>
  logout: () => void
}

// 기본 컨텍스트 값
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
})

// 회사 이메일 도메인 (반드시 변경!)
const COMPANY_DOMAIN = "deancompany.com"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 초기 로딩 시 로컬/세션 스토리지에서 사용자 정보 가져오기
  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem("user")
        sessionStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  // **로그인 함수 (ID만 입력받아 처리)**
  const login = async (username: string, password: string, rememberMe = false): Promise<boolean> => {
    // 1. ID를 이메일로 변환 (예: dean.yoon → dean.yoon@deancompany.com)
    const email = `${username}@${COMPANY_DOMAIN}`.toLowerCase()

    // 2. Supabase Auth 로그인 시도
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session || !data.user) {
      return false
    }

    // 3. 추가 프로필 정보 (profiles 테이블 등) 가져오기 (옵션)
    let profileData = null
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, department, role")
        .eq("email", email)
        .single()
      profileData = profile
    } catch {
      // 무시 (profile 테이블 없으면 에러 안냄)
    }

    // 4. user 상태 저장
    const userObj: User = {
      id: data.user.id,
      email: data.user.email ?? "",
      name: profileData?.name ?? "",
      department: profileData?.department ?? "",
      role: profileData?.role ?? "user",
    }
    setUser(userObj)

    // 5. 자동 로그인 정보 저장
    const userString = JSON.stringify(userObj)
    if (rememberMe) {
      localStorage.setItem("user", userString)
      sessionStorage.removeItem("user")
    } else {
      sessionStorage.setItem("user", userString)
      localStorage.removeItem("user")
    }

    return true
  }

  // 로그아웃 함수
  const logout = async () => {
    setUser(null)
    localStorage.removeItem("user")
    sessionStorage.removeItem("user")
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 인증 컨텍스트 사용을 위한 훅
export const useAuth = () => useContext(AuthContext)
