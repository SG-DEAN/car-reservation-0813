"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { Save, KeyRound } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    department: "",
  })

useEffect(() => {
  const fetchProfile = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("name, email, department")
      .eq("user_id", user.id)
      .single();
    if (data) {
      setProfile({
        name: data.name || "",
        email: data.email || "",
        department: data.department || "",
      });
    }
  };
  fetchProfile();
}, [user?.id]);

  // 비밀번호 변경 관련 상태
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [pwLoading, setPwLoading] = useState(false)

  const handleProfileSave = async () => {
    if (!user?.id) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        department: profile.department,
        email: profile.email,
      })
      .eq("user_id", user.id);

    if (!error) {
      toast({
        title: "프로필 저장 완료",
        description: "프로필 정보가 저장되었습니다.",
      });
    } else {
      toast({
        title: "저장 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (!password.new || password.new !== password.confirm) {
      toast({
        title: "비밀번호 불일치",
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      })
      return
    }
    setPwLoading(true)
    // 실제 비밀번호 변경 API 연동 로직 필요
    setTimeout(() => {
      setPwLoading(false)
      toast({
        title: "비밀번호 변경 완료",
        description: "새 비밀번호로 변경되었습니다.",
      })
      setPassword({ current: "", new: "", confirm: "" })
    }, 1000)
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl">로그인이 필요합니다</div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* 프로필 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>프로필 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">부서</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleProfileSave} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="mr-2 h-4 w-4" />
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 비밀번호 변경 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-blue-600" />
                  비밀번호 변경
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-pw">현재 비밀번호</Label>
                  <Input
                    id="current-pw"
                    type="password"
                    value={password.current}
                    onChange={(e) => setPassword({ ...password, current: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-pw">새 비밀번호</Label>
                  <Input
                    id="new-pw"
                    type="password"
                    value={password.new}
                    onChange={(e) => setPassword({ ...password, new: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pw">새 비밀번호 확인</Label>
                  <Input
                    id="confirm-pw"
                    type="password"
                    value={password.confirm}
                    onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={pwLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {pwLoading ? "변경 중..." : "비밀번호 변경"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
