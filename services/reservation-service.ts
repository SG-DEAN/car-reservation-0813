// services/reservation-service.ts
"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { supabase } from "@/lib/supabaseClient"

export interface Car {
  id: string
  name: string
  image: string
  type: string
  color: string
  seats: string
  location: string
  licensePlate: string
  status: "available" | "reserved"
}

export interface Reservation {
  id: string
  carId: string
  userId: string
  userName: string
  startTime: string
  endTime: string
  purpose?: string
  destination?: string
  isDirect: boolean
  passengers: string[]
  createdAt: string
  updatedAt?: string
}

interface ReservationStore {
  cars: Car[]
  reservations: Reservation[]
  lastUpdate: number

  hasHydrated: boolean
  setHasHydrated: (v: boolean) => void

  setReservations: (list: Reservation[]) => void
  fetchReservations: () => Promise<void>

  subscribeToReservations: () => () => void
  
  addReservation: (reservation: Reservation) => void
  updateReservation: (id: string, updates: Partial<Reservation>) => void
  deleteReservation: (id: string) => void
}

const sampleCars: Car[] = [
  {
    id: "1",
    name: "카니발 (223허 9561)",
    image: "https://i.ibb.co/QFt1WDwL/223-9561-removebg-preview.png",
    type: "SUV",
    color: "blue",
    seats: "7",
    location: "본사",
    licensePlate: "223허 9561",
    status: "available",
  },
  {
    id: "2",
    name: "아이오닉 (49호 8181)",
    image: "https://i.ibb.co/bMdkXZg3/31-7136-removebg-preview.png",
    type: "전기차",
    color: "green",
    seats: "5",
    location: "지점",
    licensePlate: "49호 8181",
    status: "available",
  },
  {
    id: "3",
    name: "소나타 (12가 1234)",
    image: "https://i.ibb.co/xxxxx.png",
    type: "세단",
    color: "white",
    seats: "5",
    location: "본사",
    licensePlate: "12가 1234",
    status: "available",
  },
  {
    id: "4",
    name: "K5 (34나 5678)",
    image: "https://i.ibb.co/xxxxx.png",
    type: "세단",
    color: "black",
    seats: "5",
    location: "본사",
    licensePlate: "34나 5678",
    status: "available",
  },
  {
    id: "5",
    name: "GV80 (56다 9012)",
    image: "https://i.ibb.co/xxxxx.png",
    type: "SUV",
    color: "silver",
    seats: "5",
    location: "지점",
    licensePlate: "56다 9012",
    status: "available",
  },
  {
    id: "6",
    name: "쏘렌토 (78라 3456)",
    image: "https://i.ibb.co/xxxxx.png",
    type: "SUV",
    color: "gray",
    seats: "7",
    location: "본사",
    licensePlate: "78라 3456",
    status: "available",
  },
  {
    id: "7",
    name: "팰리세이드 (90마 7890)",
    image: "https://i.ibb.co/xxxxx.png",
    type: "SUV",
    color: "white",
    seats: "8",
    location: "지점",
    licensePlate: "90마 7890",
    status: "available",
  },
]

export const useReservationStore = create<ReservationStore>()(
  persist(
    (set, get) => ({
      cars: sampleCars,
      reservations: [],
      lastUpdate: Date.now(),

      // 🔹 Supabase에서 예약 가져오기
      fetchReservations: async () => {
        const { data, error } = await supabase
          .from("reservations")
          .select("*")
          .order("start_time", { ascending: true })
        
        if (error) {
          console.error("[reservations] fetch error:", error)
          return
        }

        const mapped = (data ?? []).map((r) => ({
          id: r.id,
          carId: r.car_id,
          userId: r.user_id,
          userName: r.user_name ?? "", // DB에 없으면 빈 문자열
          startTime: r.start_time,
          endTime: r.end_time,
          purpose: r.purpose ?? "",
          destination: r.destination ?? "",
          isDirect: r.is_direct,
          passengers: r.passengers ?? [],
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }))

        set({ reservations: mapped, lastUpdate: Date.now() })
      },

      // 🔹 실시간 구독 설정
      subscribeToReservations: () => {
        const channel = supabase
          .channel("reservations-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "reservations",
            },
            (payload) => {
              console.log("📡 예약 변경 감지됨:", payload)
              get().fetchReservations()
            }
          )
          .subscribe()

        return channel
      },

      // 🔹 예약 추가
      addReservation: (reservation) => {
        set((state) => ({
          reservations: [
            ...state.reservations,
            { ...reservation, createdAt: new Date().toISOString() },
          ],
          lastUpdate: Date.now(),
        }))
      },

      // 🔹 예약 수정
      updateReservation: (id, updates) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id
              ? { ...r, ...updates, updatedAt: new Date().toISOString() }
              : r
          ),
          lastUpdate: Date.now(),
        }))
      },

      // 🔹 예약 삭제
      deleteReservation: (id) => {
        set((state) => ({
          reservations: state.reservations.filter((r) => r.id !== id),
          lastUpdate: Date.now(),
        }))
      },
    }),
    {
      name: "car-reservations",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
