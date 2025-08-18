"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { getSupabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const sb = getSupabase();

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl">
        로딩 중…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl">
        로그인이 필요합니다
      </div>
    );
  }

  const handlePasswordChange = async () => {
    // 기본 검증
    if (!pw.current || !pw.next || !pw.confirm) {
      toast({
        title: "입력 필요",
        description: "현재/새 비밀번호를 모두 입력해 주세요.",
        variant: "destructive",
      });
      return;
    }
    if (pw.next !== pw.confirm) {
      toast({
        title: "비밀번호 불일치",
        description: "새 비밀번호 확인이 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }
    if (pw.next.length < 8) {
      toast({
        title: "너무 짧은 비밀번호",
        description: "새 비밀번호는 8자 이상을 권장합니다.",
        variant: "destructive",
      });
      return;
    }
    if (pw.current === pw.next) {
      toast({
        title: "동일한 비밀번호",
        description: "현재 비밀번호와 다른 비밀번호로 변경해 주세요.",
      });
      return;
    }

    try {
      setPwLoading(true);

      // 1) 현재 비밀번호 검증: 이메일 + 현재 비밀번호로 재로그인 시도
      //    (성공하면 세션이 최신화되고, 실패하면 에러 반환)
      const email = user.email;
      if (!email) {
        throw new Error("이메일 정보를 찾을 수 없습니다.");
      }

      const signIn = await sb.auth.signInWithPassword({
        email,
        password: pw.current,
      });

      if (signIn.error) {
        // 현재 비밀번호 틀린 경우가 대부분
        throw new Error(signIn.error.message || "현재 비밀번호가 올바르지 않습니다.");
      }

      // 2) 새 비밀번호로 업데이트
      const upd = await sb.auth.updateUser({ password: pw.next });
      if (upd.error) {
        throw new Error(upd.error.message || "비밀번호 변경에 실패했습니다.");
      }

      // 3) 성공 피드백
      toast({
        title: "비밀번호 변경 완료",
        description: "새 비밀번호로 변경되었습니다.",
      });
      setPw({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      toast({
        title: "변경 실패",
        description: err?.message ?? "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* 프로필 정보 (읽기 전용) */}
            <Card>
              <CardHeader>
                <CardTitle>프로필 (읽기 전용)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input id="name" value={user.name ?? ""} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input id="email" type="email" value={user.email ?? ""} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">부서</Label>
                  <Input id="department" value={user.department ?? ""} readOnly disabled />
                </div>
              </CardContent>
            </Card>

            {/* 비밀번호 변경 */}
            <Card>
              <CardHeader>
                <CardTitle>비밀번호 변경</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pw-current">현재 비밀번호</Label>
                  <Input
                    id="pw-current"
                    type="password"
                    value={pw.current}
                    onChange={(e) => setPw({ ...pw, current: e.target.value })}
                    placeholder="현재 비밀번호"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-next">새 비밀번호</Label>
                  <Input
                    id="pw-next"
                    type="password"
                    value={pw.next}
                    onChange={(e) => setPw({ ...pw, next: e.target.value })}
                    placeholder="새 비밀번호 (8자 이상 권장)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-confirm">새 비밀번호 확인</Label>
                  <Input
                    id="pw-confirm"
                    type="password"
                    value={pw.confirm}
                    onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                    placeholder="새 비밀번호 다시 입력"
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
  );
}
