"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { Bell, User, Globe, Shield, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    preferences: {
      language: "ko",
      timezone: "Asia/Seoul",
      theme: "light",
    },
    profile: {
      name: user?.name || "",
      email: user?.email || "",
      department: user?.department || "",
    },
  })

  // --- **여기서부터 추가!** ---
  // 프로필 저장 함수
  const handleProfileSave = async () => {
    if (!user?.email) return
    const { error } = await supabase
      .from("profiles")
      .update({
        name: settings.profile.name,
        department: settings.profile.department,
      })
      .eq("email", user.email)

    if (!error) {
      toast({ title: "프로필 저장 완료", description: "프로필 정보가 저장되었습니다." })
    } else {
      toast({ title: "저장 실패", description: error.message, variant: "destructive" })
    }
  }

  const handleSave = () => {
    // 설정 저장 로직
    toast({
      title: "설정이 저장되었습니다",
      description: "변경사항이 성공적으로 적용되었습니다.",
    })
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="container px-4 py-8 md:px-6 md:py-12">
            <Card className="max-w-md mx-auto">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">로그인이 필요합니다</h3>
                <p className="text-gray-500 mb-6 text-center">설정을 변경하려면 먼저 로그인해주세요.</p>
                <Button className="bg-blue-600 hover:bg-blue-700">로그인하기</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-gray-50">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">설정</h1>
              <p className="text-gray-500 mt-1">계정 및 애플리케이션 설정을 관리하세요</p>
            </div>

            <div className="grid gap-6">
              {/* 알림 설정 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    알림 설정
                  </CardTitle>
                  <CardDescription>예약 관련 알림을 설정합니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>이메일 알림</Label>
                      <p className="text-sm text-gray-500">예약 확인 및 변경사항을 이메일로 받습니다</p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, email: checked },
                        })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>푸시 알림</Label>
                      <p className="text-sm text-gray-500">브라우저 푸시 알림을 받습니다</p>
                    </div>
                    <Switch
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, push: checked },
                        })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS 알림</Label>
                      <p className="text-sm text-gray-500">중요한 알림을 SMS로 받습니다</p>
                    </div>
                    <Switch
                      checked={settings.notifications.sms}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, sms: checked },
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 시스템 설정 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    시스템 설정
                  </CardTitle>
                  <CardDescription>언어, 시간대 등 시스템 설정을 관리합니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">언어</Label>
                      <select
                        id="language"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={settings.preferences.language}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            preferences: { ...settings.preferences, language: e.target.value },
                          })
                        }
                      >
                        <option value="ko">한국어</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">시간대</Label>
                      <select
                        id="timezone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={settings.preferences.timezone}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            preferences: { ...settings.preferences, timezone: e.target.value },
                          })
                        }
                      >
                        <option value="Asia/Seoul">서울 (GMT+9)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 저장 버튼 */}
              <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="mr-2 h-4 w-4" />
                  설정 저장
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
