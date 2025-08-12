"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Plus, Pencil, Trash2, Download } from "lucide-react"
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

// 사용자 타입 정의
interface User {
  id: string
  name: string
  email: string
  username?: string
  department: string
  role: "admin" | "user"
  password?: string
}

export default function UsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    department: "",
    role: "user" as "admin" | "user",
  })
  const [isTestAccountDialogOpen, setIsTestAccountDialogOpen] = useState(false)

  // 관리자가 아니면 홈으로 리다이렉트
  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/")
      return
    }

    // 실제 구현에서는 API에서 사용자 목록을 가져옴
    // 여기서는 샘플 데이터 사용
    const sampleUsers: User[] = [
      {
        id: "1",
        name: "관리자",
        email: "admin@company.com",
        username: "admin",
        department: "관리부",
        role: "admin",
      },
      {
        id: "2",
        name: "홍길동",
        email: "user1@company.com",
        username: "honggildong",
        department: "영업부",
        role: "user",
      },
      {
        id: "3",
        name: "김철수",
        email: "user2@company.com",
        username: "kimchulsoo",
        department: "개발부",
        role: "user",
      },
      {
        id: "4",
        name: "윤딘",
        email: "user3@company.com",
        username: "deanyoon",
        department: "마케팅부",
        role: "user",
      },
    ]

    setUsers(sampleUsers)
    setIsLoading(false)
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
      username: "",
      password: "",
      department: "",
      role: "user",
    })
    setIsDialogOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username || "",
      password: "",
      department: user.department,
      role: user.role,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    // 실제 구현에서는 API 호출로 사용자 삭제
    setUsers((prev) => prev.filter((user) => user.id !== userId))
    toast({
      title: "사용자 삭제 완료",
      description: "사용자가 성공적으로 삭제되었습니다.",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.department || !formData.username) {
      toast({
        title: "입력 오류",
        description: "모든 필수 필드를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!editingUser && !formData.password) {
      toast({
        title: "입력 오류",
        description: "새 사용자의 비밀번호를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 실제 구현에서는 API 호출로 사용자 추가/수정
    if (editingUser) {
      // 사용자 수정
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formData.name,
                email: formData.email,
                username: formData.username,
                department: formData.department,
                role: formData.role,
                ...(formData.password ? { password: formData.password } : {}),
              }
            : u,
        ),
      )
      toast({
        title: "사용자 수정 완료",
        description: "사용자 정보가 성공적으로 수정되었습니다.",
      })
    } else {
      // 새 사용자 추가
      const newUser: User = {
        id: Math.random().toString(36).substring(2),
        name: formData.name,
        email: formData.email,
        username: formData.username,
        department: formData.department,
        role: formData.role,
        password: formData.password,
      }
      setUsers((prev) => [...prev, newUser])
      toast({
        title: "사용자 추가 완료",
        description: "새 사용자가 성공적으로 추가되었습니다.",
      })
    }

    setIsDialogOpen(false)
  }

  const handleShowTestAccounts = () => {
    setIsTestAccountDialogOpen(true)
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
            <h1 className="text-2xl font-bold">사용자 관리</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShowTestAccounts} className="gap-1">
                <Download className="h-4 w-4" /> 테스트 계정 정보
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddUser} className="gap-1">
                    <Plus className="h-4 w-4" /> 사용자 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingUser ? "사용자 수정" : "새 사용자 추가"}</DialogTitle>
                    <DialogDescription>
                      {editingUser
                        ? "사용자 정보를 수정하세요. 비밀번호는 변경할 경우에만 입력하세요."
                        : "새 사용자 정보를 입력하세요."}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">이름</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">이메일</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">ID (로그인용)</Label>
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">
                          비밀번호 {editingUser && <span className="text-xs text-gray-500">(변경 시에만 입력)</span>}
                        </Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required={!editingUser}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">부서</Label>
                        <Input
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">권한</Label>
                        <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                          <SelectTrigger id="role">
                            <SelectValue placeholder="권한 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">일반 사용자</SelectItem>
                            <SelectItem value="admin">관리자</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{editingUser ? "수정" : "추가"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>사용자 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">로딩 중...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>부서</TableHead>
                      <TableHead>권한</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>{user.role === "admin" ? "관리자" : "일반 사용자"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} title="수정">
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
                                  <AlertDialogTitle>사용자 삭제</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>취소</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>삭제</AlertDialogAction>
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

      {/* 테스트 계정 정보 다이얼로그 */}
      <Dialog open={isTestAccountDialogOpen} onOpenChange={setIsTestAccountDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>테스트 계정 정보</DialogTitle>
            <DialogDescription>아래 계정 정보로 로그인하여 시스템을 테스트할 수 있습니다.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h3 className="font-medium mb-2">관리자 계정</h3>
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">ID:</div>
                <div className="text-sm">admin</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">비밀번호:</div>
                <div className="text-sm">admin123</div>
              </div>
            </div>

            <h3 className="font-medium mb-2">일반 사용자 계정</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">ID:</div>
                <div className="text-sm">honggildong</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">비밀번호:</div>
                <div className="text-sm">honggildong</div>
              </div>
            </div>
            <div className="space-y-2 mt-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">ID:</div>
                <div className="text-sm">kimchulsoo</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">비밀번호:</div>
                <div className="text-sm">kimchulsoo</div>
              </div>
            </div>
            <div className="space-y-2 mt-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">ID:</div>
                <div className="text-sm">deanyoon</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">비밀번호:</div>
                <div className="text-sm">deanyoon</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsTestAccountDialogOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row">
          <p className="text-sm text-gray-500">© 2023 SG 법인차량 예약 서비스. 모든 권리 보유.</p>
        </div>
      </footer>
    </div>
  )
}
