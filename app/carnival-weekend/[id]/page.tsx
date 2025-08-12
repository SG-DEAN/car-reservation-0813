"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ko } from "date-fns/locale"
import { ChevronLeft, Calendar, Clock, User, Car, CheckCircle2, XCircle, Trash2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

// 주말 사용 신청 상태 타입
type RequestStatus = "pending" | "approved" | "rejected"

// 주말 사용 신청 타입
interface WeekendRequest {
  id: string
  userId: string
  userName: string
  userDepartment: string
  startDate: string
  endDate: string
  purpose: string
  status: RequestStatus
  createdAt: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  rejectedReason?: string
  odometerBefore?: string
  odometerAfter?: string
  notes?: string
  beforeImage?: string
  afterImage?: string
}

interface WeekendRequestDetailPageProps {
  params: {
    id: string
  }
}

export default function WeekendRequestDetailPage({ params }: WeekendRequestDetailPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [odometerBefore, setOdometerBefore] = useState<string>("")
  const [odometerAfter, setOdometerAfter] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [rejectionReason, setRejectionReason] = useState<string>("")
  const [beforeImageFile, setBeforeImageFile] = useState<File | null>(null)
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null)
  const [beforeImagePreview, setBeforeImagePreview] = useState<string | null>(null)
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(null)
  const [request, setRequest] = useState<WeekendRequest | null>(null)
  const [isDeleteBeforeImageDialogOpen, setIsDeleteBeforeImageDialogOpen] = useState(false)
  const [isDeleteAfterImageDialogOpen, setIsDeleteAfterImageDialogOpen] = useState(false)
  const [isViewBeforeImageDialogOpen, setIsViewBeforeImageDialogOpen] = useState(false)
  const [isViewAfterImageDialogOpen, setIsViewAfterImageDialogOpen] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0) // 강제 리렌더링을 위한 상태

  // 로컬 스토리지에서 주말 사용 신청 데이터 로드
  useEffect(() => {
    const loadRequest = () => {
      try {
        const storedRequests = localStorage.getItem("carnival-weekend-requests")
        if (storedRequests) {
          const requests: WeekendRequest[] = JSON.parse(storedRequests)
          const foundRequest = requests.find((r) => r.id === params.id)
          if (foundRequest) {
            setRequest(foundRequest)
            setOdometerBefore(foundRequest.odometerBefore || "")
            setOdometerAfter(foundRequest.odometerAfter || "")
            setNotes(foundRequest.notes || "")
            setBeforeImagePreview(foundRequest.beforeImage || null)
            setAfterImagePreview(foundRequest.afterImage || null)
          }
        }
      } catch (error) {
        console.error("Error loading weekend request:", error)
      }
    }

    loadRequest()
  }, [params.id, forceUpdate])

  // 스토리지 이벤트 리스너 추가
  useEffect(() => {
    // 다른 탭/창에서 스토리지 변경 시 업데이트
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "carnival-weekend-requests") {
        console.log("주말 사용 상세: 스토리지 변경 감지됨")
        setForceUpdate((prev) => prev + 1)
      }
    }

    // 같은 탭 내에서의 변경 감지를 위한 커스텀 이벤트 리스너
    const handleCustomStorageChange = () => {
      console.log("주말 사용 상세: 커스텀 스토리지 변경 감지됨")
      setForceUpdate((prev) => prev + 1)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("carnival-weekend-updated", handleCustomStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("carnival-weekend-updated", handleCustomStorageChange)
    }
  }, [])

  // 날짜 포맷 함수 - 오류 방지를 위한 안전한 포맷팅
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "yyyy년 MM월 dd일 (EEE) HH:mm", { locale: ko })
    } catch (error) {
      return dateString
    }
  }

  // 상태에 따른 배지 색상 및 텍스트
  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            승인 대기
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            승인됨
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            거부됨
          </Badge>
        )
    }
  }

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === "before") {
      setBeforeImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBeforeImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setAfterImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAfterImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 이미지 삭제 핸들러
  const handleDeleteImage = (type: "before" | "after") => {
    if (!request) return

    try {
      const storedRequests = localStorage.getItem("carnival-weekend-requests")
      if (storedRequests) {
        const requests: WeekendRequest[] = JSON.parse(storedRequests)
        const updatedRequests = requests.map((r) => {
          if (r.id === request.id) {
            if (type === "before") {
              return { ...r, beforeImage: undefined }
            } else {
              return { ...r, afterImage: undefined }
            }
          }
          return r
        })

        localStorage.setItem("carnival-weekend-requests", JSON.stringify(updatedRequests))

        // 커스텀 이벤트 발생 (같은 탭 내에서의 변경 알림)
        window.dispatchEvent(new Event("carnival-weekend-updated"))

        // 스토리지 이벤트 발생 (다른 탭/창에 변경 알림)
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "carnival-weekend-requests",
            newValue: JSON.stringify(updatedRequests),
          }),
        )

        if (type === "before") {
          setBeforeImagePreview(null)
          setBeforeImageFile(null)
          setIsDeleteBeforeImageDialogOpen(false)
        } else {
          setAfterImagePreview(null)
          setAfterImageFile(null)
          setIsDeleteAfterImageDialogOpen(false)
        }

        toast({
          title: "이미지 삭제 완료",
          description: `${type === "before" ? "사용 전" : "사용 후"} 계기판 사진이 삭제되었습니다.`,
        })
      }
    } catch (error) {
      toast({
        title: "삭제 실패",
        description: "이미지 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 사용 전 정보 제출 핸들러
  const handleBeforeSubmit = () => {
    if (!request) return

    if (!odometerBefore) {
      toast({
        title: "정보 필요",
        description: "주행거리를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const storedRequests = localStorage.getItem("carnival-weekend-requests")
      if (storedRequests) {
        const requests: WeekendRequest[] = JSON.parse(storedRequests)
        const updatedRequests = requests.map((r) => {
          if (r.id === request.id) {
            return {
              ...r,
              odometerBefore,
              beforeImage: beforeImagePreview,
            }
          }
          return r
        })

        localStorage.setItem("carnival-weekend-requests", JSON.stringify(updatedRequests))

        // 커스텀 이벤트 발생 (같은 탭 내에서의 변경 알림)
        window.dispatchEvent(new Event("carnival-weekend-updated"))

        // 스토리지 이벤트 발생 (다른 탭/창에 변경 알림)
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "carnival-weekend-requests",
            newValue: JSON.stringify(updatedRequests),
          }),
        )

        setTimeout(() => {
          setIsSubmitting(false)
          toast({
            title: "정보 저장 완료",
            description: "사용 전 정보가 저장되었습니다.",
          })
          setForceUpdate((prev) => prev + 1)
        }, 1000)
      }
    } catch (error) {
      setIsSubmitting(false)
      toast({
        title: "저장 실패",
        description: "정보 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 사용 후 정보 제출 핸들러
  const handleAfterSubmit = () => {
    if (!request) return

    if (!odometerAfter) {
      toast({
        title: "정보 필요",
        description: "주행거리를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const storedRequests = localStorage.getItem("carnival-weekend-requests")
      if (storedRequests) {
        const requests: WeekendRequest[] = JSON.parse(storedRequests)
        const updatedRequests = requests.map((r) => {
          if (r.id === request.id) {
            return {
              ...r,
              odometerAfter,
              notes,
              afterImage: afterImagePreview,
            }
          }
          return r
        })

        localStorage.setItem("carnival-weekend-requests", JSON.stringify(updatedRequests))

        // 커스텀 이벤트 발생 (같은 탭 내에서의 변경 알림)
        window.dispatchEvent(new Event("carnival-weekend-updated"))

        // 스토리지 이벤트 발생 (다른 탭/창에 변경 알림)
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "carnival-weekend-requests",
            newValue: JSON.stringify(updatedRequests),
          }),
        )

        setTimeout(() => {
          setIsSubmitting(false)
          toast({
            title: "정보 저장 완료",
            description: "사용 후 정보가 저장되었습니다.",
          })
          setForceUpdate((prev) => prev + 1)
        }, 1000)
      }
    } catch (error) {
      setIsSubmitting(false)
      toast({
        title: "저장 실패",
        description: "정보 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 관리자 승인 핸들러
  const handleApprove = () => {
    if (!request || !user) return

    setIsSubmitting(true)

    try {
      const storedRequests = localStorage.getItem("carnival-weekend-requests")
      if (storedRequests) {
        const requests: WeekendRequest[] = JSON.parse(storedRequests)
        const updatedRequests = requests.map((r) => {
          if (r.id === request.id) {
            return {
              ...r,
              status: "approved",
              approvedAt: new Date().toISOString(),
              approvedBy: user.name,
            }
          }
          return r
        })

        localStorage.setItem("carnival-weekend-requests", JSON.stringify(updatedRequests))

        // 커스텀 이벤트 발생 (같은 탭 내에서의 변경 알림)
        window.dispatchEvent(new Event("carnival-weekend-updated"))

        // 스토리지 이벤트 발생 (다른 탭/창에 변경 알림)
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "carnival-weekend-requests",
            newValue: JSON.stringify(updatedRequests),
          }),
        )

        setTimeout(() => {
          setIsSubmitting(false)
          toast({
            title: "승인 완료",
            description: "주말 사용 신청이 승인되었습니다.",
          })
          router.push("/carnival-weekend")
        }, 1000)
      }
    } catch (error) {
      setIsSubmitting(false)
      toast({
        title: "승인 실패",
        description: "승인 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 관리자 거부 핸들러
  const handleReject = () => {
    if (!request || !user) return

    if (!rejectionReason) {
      toast({
        title: "거부 사유 필요",
        description: "거부 사유를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const storedRequests = localStorage.getItem("carnival-weekend-requests")
      if (storedRequests) {
        const requests: WeekendRequest[] = JSON.parse(storedRequests)
        const updatedRequests = requests.map((r) => {
          if (r.id === request.id) {
            return {
              ...r,
              status: "rejected",
              rejectedAt: new Date().toISOString(),
              rejectedBy: user.name,
              rejectedReason: rejectionReason,
            }
          }
          return r
        })

        localStorage.setItem("carnival-weekend-requests", JSON.stringify(updatedRequests))

        // 커스텀 이벤트 발생 (같은 탭 내에서의 변경 알림)
        window.dispatchEvent(new Event("carnival-weekend-updated"))

        // 스토리지 이벤트 발생 (다른 탭/창에 변경 알림)
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "carnival-weekend-requests",
            newValue: JSON.stringify(updatedRequests),
          }),
        )

        setTimeout(() => {
          setIsSubmitting(false)
          toast({
            title: "거부 완료",
            description: "주말 사용 신청이 거부되었습니다.",
          })
          router.push("/carnival-weekend")
        }, 1000)
      }
    } catch (error) {
      setIsSubmitting(false)
      toast({
        title: "거부 실패",
        description: "거부 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  if (!request) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>요청을 찾을 수 없음</CardTitle>
              <CardDescription>해당 주말 사용 신청을 찾을 수 없습니다.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/carnival-weekend" className="w-full">
                <Button className="w-full">돌아가기</Button>
              </Link>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }

  const isAdmin = user?.role === "admin"
  const isOwner = user?.id === request.userId
  const canEdit = isOwner || isAdmin
  const isPending = request.status === "pending"
  const isApproved = request.status === "approved"

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="mb-6">
            <Link
              href="/carnival-weekend"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              카니발 주말 사용으로 돌아가기
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>주말 사용 신청 상세</CardTitle>
                    <CardDescription>신청 ID: {request.id}</CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-500">차량</Label>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">카니발 (223허 9561)</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-500">신청자</Label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {request.userName} ({request.userDepartment})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-500">사용 시작</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{formatDate(request.startDate)}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-500">사용 종료</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{formatDate(request.endDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm text-gray-500">이용 목적</Label>
                    <div className="rounded-md border p-3">
                      <p>{request.purpose}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm text-gray-500">신청 일시</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{formatDate(request.createdAt)}</span>
                    </div>
                  </div>

                  {isApproved && request.approvedAt && (
                    <div className="rounded-md bg-green-50 p-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-700">승인됨</p>
                          <p className="text-sm text-green-600">
                            {request.approvedBy}님이 {formatDate(request.approvedAt)}에 승인함
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {request.status === "rejected" && request.rejectedAt && (
                    <div className="rounded-md bg-red-50 p-3">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-700">거부됨</p>
                          <p className="text-sm text-red-600">
                            {request.rejectedBy}님이 {formatDate(request.rejectedAt)}에 거부함
                          </p>
                          {request.rejectedReason && (
                            <p className="text-sm text-red-600 mt-1">사유: {request.rejectedReason}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {isApproved && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="font-medium">사용 정보</h3>

                        {request.odometerBefore ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-sm text-gray-500">사용 전 주행거리</Label>
                              <div className="font-medium">{request.odometerBefore} km</div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-sm text-gray-500">사용 후 주행거리</Label>
                              <div className="font-medium">{request.odometerAfter || "미입력"}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-md bg-yellow-50 p-3 text-yellow-700">
                            <p className="font-medium">사용 정보 미입력</p>
                            <p className="text-sm">아직 사용 전/후 정보가 입력되지 않았습니다.</p>
                          </div>
                        )}

                        {request.notes && (
                          <div className="space-y-1">
                            <Label className="text-sm text-gray-500">특이사항</Label>
                            <div className="rounded-md border p-3">
                              <p>{request.notes}</p>
                            </div>
                          </div>
                        )}

                        {/* 계기판 사진 표시 영역 */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm text-gray-500">사용 전 계기판 사진</Label>
                            {request.beforeImage ? (
                              <div className="border rounded-md p-2 relative">
                                <div
                                  className="h-40 w-full bg-contain bg-center bg-no-repeat cursor-pointer"
                                  style={{ backgroundImage: `url(${request.beforeImage})` }}
                                  onClick={() => setIsViewBeforeImageDialogOpen(true)}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                                  onClick={() => setIsViewBeforeImageDialogOpen(true)}
                                >
                                  <ImageIcon className="h-4 w-4 mr-1" /> 확대
                                </Button>
                              </div>
                            ) : (
                              <div className="border rounded-md p-4 text-center text-gray-500">사진이 없습니다</div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-gray-500">사용 후 계기판 사진</Label>
                            {request.afterImage ? (
                              <div className="border rounded-md p-2 relative">
                                <div
                                  className="h-40 w-full bg-contain bg-center bg-no-repeat cursor-pointer"
                                  style={{ backgroundImage: `url(${request.afterImage})` }}
                                  onClick={() => setIsViewAfterImageDialogOpen(true)}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                                  onClick={() => setIsViewAfterImageDialogOpen(true)}
                                >
                                  <ImageIcon className="h-4 w-4 mr-1" /> 확대
                                </Button>
                              </div>
                            ) : (
                              <div className="border rounded-md p-4 text-center text-gray-500">사진이 없습니다</div>
                            )}
                          </div>
                        </div>

                        {isOwner && (
                          <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">사용 전 정보 입력</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="odometerBefore">사용 전 주행거리 (km)</Label>
                                  <Input
                                    id="odometerBefore"
                                    type="number"
                                    placeholder="예: 12345"
                                    value={odometerBefore}
                                    onChange={(e) => setOdometerBefore(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="beforeImage">계기판 사진</Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      id="beforeImage"
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageChange(e, "before")}
                                      className="flex-1"
                                    />
                                  </div>
                                  {beforeImagePreview && (
                                    <div className="mt-2 border rounded-md p-2">
                                      <div className="relative h-40 w-full">
                                        <div
                                          className="h-full w-full bg-contain bg-center bg-no-repeat"
                                          style={{ backgroundImage: `url(${beforeImagePreview})` }}
                                        />
                                        <div className="absolute top-2 right-2 flex gap-1">
                                          <AlertDialog
                                            open={isDeleteBeforeImageDialogOpen}
                                            onOpenChange={setIsDeleteBeforeImageDialogOpen}
                                          >
                                            <AlertDialogTrigger asChild>
                                              <Button variant="destructive" size="icon" className="h-8 w-8">
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>이미지 삭제</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  사용 전 계기판 사진을 삭제하시겠습니까?
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>취소</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteImage("before")}>
                                                  삭제
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  onClick={handleBeforeSubmit}
                                  disabled={isSubmitting || !odometerBefore}
                                  className="w-full"
                                >
                                  {isSubmitting ? "저장 중..." : "저장"}
                                </Button>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">사용 후 정보 입력</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="odometerAfter">사용 후 주행거리 (km)</Label>
                                  <Input
                                    id="odometerAfter"
                                    type="number"
                                    placeholder="예: 12400"
                                    value={odometerAfter}
                                    onChange={(e) => setOdometerAfter(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="afterImage">계기판 사진</Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      id="afterImage"
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageChange(e, "after")}
                                      className="flex-1"
                                    />
                                  </div>
                                  {afterImagePreview && (
                                    <div className="mt-2 border rounded-md p-2">
                                      <div className="relative h-40 w-full">
                                        <div
                                          className="h-full w-full bg-contain bg-center bg-no-repeat"
                                          style={{ backgroundImage: `url(${afterImagePreview})` }}
                                        />
                                        <div className="absolute top-2 right-2 flex gap-1">
                                          <AlertDialog
                                            open={isDeleteAfterImageDialogOpen}
                                            onOpenChange={setIsDeleteAfterImageDialogOpen}
                                          >
                                            <AlertDialogTrigger asChild>
                                              <Button variant="destructive" size="icon" className="h-8 w-8">
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>이미지 삭제</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  사용 후 계기판 사진을 삭제하시겠습니까?
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>취소</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteImage("after")}>
                                                  삭제
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="notes">특이사항</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="사용 중 특이사항이 있으면 입력해주세요"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="resize-none"
                                    rows={3}
                                  />
                                </div>
                                <Button
                                  onClick={handleAfterSubmit}
                                  disabled={isSubmitting || !odometerAfter}
                                  className="w-full"
                                >
                                  {isSubmitting ? "저장 중..." : "저장"}
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
                {isAdmin && isPending && (
                  <CardFooter className="flex justify-between">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                          거부
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>주말 사용 신청 거부</DialogTitle>
                          <DialogDescription>
                            이 주말 사용 신청을 거부하시겠습니까? 거부 사유를 입력해주세요.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 py-4">
                          <Label htmlFor="rejectionReason">거부 사유</Label>
                          <Textarea
                            id="rejectionReason"
                            placeholder="거부 사유를 입력해주세요"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="resize-none"
                            rows={4}
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setRejectionReason("")}>
                            취소
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isSubmitting || !rejectionReason}
                          >
                            {isSubmitting ? "처리 중..." : "거부"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button onClick={handleApprove} disabled={isSubmitting}>
                      {isSubmitting ? "처리 중..." : "승인"}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>주말 사용 안내</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">이용 가능 시간</h3>
                    <p className="text-sm text-gray-500">토요일, 일요일 08:00 ~ 18:00</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">이용 규칙</h3>
                    <ul className="text-sm text-gray-500 space-y-1 list-disc pl-4">
                      <li>주말 사용은 관리자 승인 후 이용 가능합니다.</li>
                      <li>이용 전/후 계기판 사진을 반드시 업로드해야 합니다.</li>
                      <li>차량 내부 청결을 유지해주세요.</li>
                      <li>연료는 최소 절반 이상 채워서 반납해주세요.</li>
                      <li>이용 후 특이사항은 반드시 기재해주세요.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">문의 연락처</h3>
                    <p className="text-sm text-gray-500">관리자: 010-1234-5678</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* 이미지 확대 보기 다이얼로그 */}
      <Dialog open={isViewBeforeImageDialogOpen} onOpenChange={setIsViewBeforeImageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>사용 전 계기판 사진</DialogTitle>
          </DialogHeader>
          <div className="w-full h-[60vh] flex items-center justify-center">
            {request.beforeImage && (
              <img
                src={request.beforeImage || "/placeholder.svg"}
                alt="사용 전 계기판"
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewBeforeImageDialogOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewAfterImageDialogOpen} onOpenChange={setIsViewAfterImageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>사용 후 계기판 사진</DialogTitle>
          </DialogHeader>
          <div className="w-full h-[60vh] flex items-center justify-center">
            {request.afterImage && (
              <img
                src={request.afterImage || "/placeholder.svg"}
                alt="사용 후 계기판"
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewAfterImageDialogOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row">
          <p className="text-sm text-gray-500">© 2023 SG 법인차량 예약 서비스. 모든 권리 보유.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline" href="#">
              서비스 이용약관
            </Link>
            <Link className="text-sm font-medium hover:underline" href="#">
              개인정보 처리방침
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
