// 가상 서버 시뮬레이션 (실제 프로덕션에서는 실제 서버 API 사용)
class MockRealtimeServer {
  private static instance: MockRealtimeServer
  private subscribers: Set<(data: any) => void> = new Set()
  private data: any = null
  private broadcastChannel: BroadcastChannel

  constructor() {
    // BroadcastChannel을 사용하여 같은 도메인 내 탭 간 통신
    this.broadcastChannel = new BroadcastChannel("car-reservations-realtime")
    this.broadcastChannel.onmessage = (event) => {
      this.notifySubscribers(event.data)
    }
  }

  static getInstance() {
    if (!MockRealtimeServer.instance) {
      MockRealtimeServer.instance = new MockRealtimeServer()
    }
    return MockRealtimeServer.instance
  }

  subscribe(callback: (data: any) => void) {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  broadcast(data: any) {
    console.log("🚀 가상 서버: 데이터 브로드캐스트", data)
    this.data = data

    // 같은 도메인의 다른 탭들에게 알림
    this.broadcastChannel.postMessage(data)

    // 현재 탭의 구독자들에게 알림
    this.notifySubscribers(data)
  }

  private notifySubscribers(data: any) {
    console.log("📡 가상 서버: 구독자들에게 알림", this.subscribers.size, "개")
    this.subscribers.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error("구독자 알림 오류:", error)
      }
    })
  }

  getData() {
    return this.data
  }
}

export const mockServer = MockRealtimeServer.getInstance()
