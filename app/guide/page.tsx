"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Car, Calendar, AlertCircle, CheckCircle, Phone, Mail, FileText, Settings, Shield } from "lucide-react"

export default function GuidePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">차량 예약 시스템 이용 가이드</h1>
          <p className="text-xl text-muted-foreground">
            SG 법인차량 예약 시스템을 효율적으로 이용하는 방법을 안내합니다
          </p>
        </div>

        {/* 빠른 시작 가이드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              빠른 시작 가이드
            </CardTitle>
            <CardDescription>처음 사용하시는 분들을 위한 간단한 예약 방법</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  1단계
                </Badge>
                <h3 className="font-semibold">로그인</h3>
                <p className="text-sm text-muted-foreground">
                  우측 상단의 로그인 버튼을 클릭하여 계정으로 로그인합니다.
                </p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  2단계
                </Badge>
                <h3 className="font-semibold">차량 선택</h3>
                <p className="text-sm text-muted-foreground">타임라인에서 원하는 차량과 시간대를 클릭합니다.</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  3단계
                </Badge>
                <h3 className="font-semibold">예약 정보 입력</h3>
                <p className="text-sm text-muted-foreground">사용 목적, 목적지, 동승자 등의 정보를 입력합니다.</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  4단계
                </Badge>
                <h3 className="font-semibold">예약 완료</h3>
                <p className="text-sm text-muted-foreground">예약하기 버튼을 클릭하여 예약을 완료합니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 차량 예약 방법 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-600" />
              차량 예약 방법
            </CardTitle>
            <CardDescription>일반 차량 예약 시스템 사용법</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">타임라인 뷰 사용법</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Badge>일별 뷰</Badge>
                  <p className="text-sm">하루 단위로 30분 간격의 상세한 예약 현황을 확인할 수 있습니다.</p>
                </div>
                <div className="space-y-2">
                  <Badge>주별 뷰</Badge>
                  <p className="text-sm">일주일 단위로 각 날짜별 예약 현황을 간략하게 확인할 수 있습니다.</p>
                </div>
                <div className="space-y-2">
                  <Badge>월별 뷰</Badge>
                  <p className="text-sm">한 달 단위로 전체적인 예약 현황을 파악할 수 있습니다.</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">예약 생성 방법</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">시간대 선택</p>
                    <p className="text-sm text-muted-foreground">
                      타임라인에서 원하는 차량의 빈 시간대를 클릭하거나 드래그하여 선택합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">예약 정보 입력</p>
                    <p className="text-sm text-muted-foreground">사용 목적, 목적지, 동승자 정보를 입력합니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">예약 확정</p>
                    <p className="text-sm text-muted-foreground">모든 정보를 확인한 후 예약하기 버튼을 클릭합니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 주말 차량 예약 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              주말 차량 예약
            </CardTitle>
            <CardDescription>주말 및 휴일 차량 이용 신청 방법</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">주말 차량 예약 특징</h3>
              <ul className="space-y-1 text-sm text-purple-800">
                <li>• 주말 및 공휴일 차량 이용을 위한 별도 신청 시스템</li>
                <li>• 사전 승인이 필요하며, 관리자 검토 후 확정</li>
                <li>• 업무 목적 및 긴급 상황에 우선 배정</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">신청 절차</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Badge variant="secondary">신청</Badge>
                  <p className="text-sm">주말 차량 메뉴에서 필요한 날짜와 사유를 입력하여 신청</p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary">검토</Badge>
                  <p className="text-sm">관리자가 신청 내용을 검토하고 승인 여부 결정</p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary">승인</Badge>
                  <p className="text-sm">승인 시 예약이 확정되며 알림 발송</p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary">이용</Badge>
                  <p className="text-sm">승인된 시간에 차량 이용 가능</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 예약 관리 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-600" />
              예약 관리
            </CardTitle>
            <CardDescription>기존 예약의 수정 및 취소 방법</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-semibold">예약 수정</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 내 예약 메뉴에서 수정할 예약 선택</li>
                  <li>• 시간, 목적지, 동승자 정보 변경 가능</li>
                  <li>• 예약 시작 1시간 전까지 수정 가능</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">예약 취소</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 예약 상세 페이지에서 취소 버튼 클릭</li>
                  <li>• 취소 사유 입력 후 확인</li>
                  <li>• 예약 시작 30분 전까지 취소 가능</li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900">주의사항</h4>
                  <p className="text-sm text-orange-800 mt-1">
                    무단 취소나 노쇼가 반복될 경우 예약 제한이 있을 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 이용 규칙 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              이용 규칙 및 주의사항
            </CardTitle>
            <CardDescription>안전하고 효율적인 차량 이용을 위한 규칙</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-semibold text-green-700">준수사항</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>예약 시간을 정확히 준수</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>차량 이용 후 연료 보충</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>차량 내부 청결 유지</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>사고 발생 시 즉시 보고</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-red-700">금지사항</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>개인 용도로 차량 사용</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>음주 후 차량 운전</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>무단으로 예약 시간 연장</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span>차량 내 흡연</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">벌점 제도</h4>
              <div className="text-sm text-red-800 space-y-1">
                <p>• 노쇼(무단 불참): 2점</p>
                <p>• 연료 미보충: 1점</p>
                <p>• 시간 초과: 1점</p>
                <p>• 5점 누적 시 1개월 예약 제한</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 문의 및 지원 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              문의 및 지원
            </CardTitle>
            <CardDescription>시스템 이용 중 문제가 있을 때 연락처</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-semibold">시스템 문의</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span>내선: 1234</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>admin@company.com</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">차량 관리</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    <span>내선: 5678</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-green-600" />
                    <span>fleet@company.com</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">운영 시간</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• 평일: 09:00 - 18:00</p>
                <p>• 점심시간: 12:00 - 13:00</p>
                <p>• 주말/공휴일: 긴급상황 시에만</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              자주 묻는 질문 (FAQ)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">Q. 예약을 취소하고 싶어요.</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  A. 내 예약 메뉴에서 해당 예약을 선택하고 취소 버튼을 클릭하세요. 예약 시작 30분 전까지 취소
                  가능합니다.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold">Q. 차량에 문제가 생겼어요.</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  A. 즉시 차량을 안전한 곳에 정차하고 차량 관리팀(내선: 5678)으로 연락하세요.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold">Q. 예약 시간을 연장하고 싶어요.</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  A. 시스템에서 해당 시간대가 비어있다면 예약 수정을 통해 연장 가능합니다. 다른 예약이 있다면 관리자에게
                  문의하세요.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold">Q. 주말에 차량을 사용할 수 있나요?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  A. 주말 차량 예약 메뉴를 통해 사전 신청하시면 검토 후 승인 여부를 알려드립니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
