// /services/reservation-service.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getSupabase } from "@/lib/supabaseClient";

/** ---------- Types ---------- */
export interface Car {
  id: string;
  name: string;
  image: string;
  type: string;
  color: string;
  seats: string;
  location: string;
  licensePlate: string;
  status: "available" | "reserved";
}

export interface Reservation {
  id: string;
  carId: string;
  userId: string;
  userName: string;
  startTime: string;       // ISO
  endTime: string;         // ISO
  purpose?: string;
  destination?: string;
  isDirect: boolean;
  passengers: string[];
  createdAt: string;       // ISO
  updatedAt?: string;      // ISO
}

/** Supabase reservations 테이블(스네이크 케이스) */
type DBReservation = {
  id: string;
  car_id: string;
  user_id: string;
  user_name: string | null;
  start_time: string;
  end_time: string;
  purpose: string | null;
  destination: string | null;
  is_direct: boolean;
  passengers: string[] | null;
  created_at: string;
  updated_at: string | null;
};

interface ReservationStore {
  cars: Car[];
  reservations: Reservation[];
  lastUpdate: number;

  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  setReservations: (list: Reservation[]) => void;
  fetchReservations: () => Promise<void>;

  /** 실시간 구독 시작 → 언마운트 시 호출할 해제 함수 반환 */
  subscribeToReservations: () => () => void;

  /** 로컬 상태만 조작(낙관적 갱신용) */
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;

  /** ===== Supabase CRUD ===== */
  createReservationOnServer: (payload: {
    carId: string;
    startTime: string;   // ISO
    endTime: string;     // ISO
    purpose?: string;
    destination?: string;
    isDirect?: boolean;
    passengers?: string[];
  }) => Promise<Reservation>;

  updateReservationOnServer: (
    id: string,
    updates: Partial<Omit<Reservation, "id" | "userId" | "userName" | "createdAt">>
  ) => Promise<Reservation>;

  deleteReservationOnServer: (id: string) => Promise<void>;
}

/** ---------- Sample Cars (임시) ---------- */
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
];

/** ---------- Helpers ---------- */
function mapDBToModel(r: DBReservation): Reservation {
  return {
    id: r.id,
    carId: r.car_id,
    userId: r.user_id,
    userName: r.user_name ?? "",
    startTime: r.start_time,
    endTime: r.end_time,
    purpose: r.purpose ?? "",
    destination: r.destination ?? "",
    isDirect: r.is_direct,
    passengers: r.passengers ?? [],
    createdAt: r.created_at,
    updatedAt: r.updated_at ?? undefined,
  };
}

/** ---------- Store ---------- */
export const useReservationStore = create<ReservationStore>()(
  persist(
    (set, get) => ({
      cars: sampleCars,
      reservations: [],
      lastUpdate: Date.now(),

      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      setReservations: (list) => set({ reservations: list, lastUpdate: Date.now() }),

      /** Read: Supabase에서 예약 가져오기 */
      fetchReservations: async () => {
        const sb = getSupabase();
        if (!sb) return;

        const { data, error } = await sb
          .from("reservations")
          .select("*")
          .order("start_time", { ascending: true });

        if (error) {
          console.error("[reservations] fetch error:", error);
          return;
        }

        const mapped: Reservation[] = (data as DBReservation[] | null)?.map(mapDBToModel) ?? [];
        set({ reservations: mapped, lastUpdate: Date.now() });
      },

      /** 실시간 구독 시작 → 해제 함수 반환 */
      subscribeToReservations: () => {
        const sb = getSupabase();
        if (!sb) return () => {};

        // Supabase 대시보드: Table -> reservations -> Realtime ON 필요
        const channel = sb
          .channel("reservations-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "reservations" },
            () => {
              // 변경 감지 시 최신 데이터로 갱신
              get().fetchReservations();
            }
          )
          .subscribe();

        return () => {
          sb.removeChannel(channel);
        };
      },

      /** ===== 로컬 상태 조작(낙관적 갱신 용) ===== */
      addReservation: (reservation) => {
        set((state) => ({
          reservations: [
            ...state.reservations,
            { ...reservation, createdAt: new Date().toISOString() },
          ],
          lastUpdate: Date.now(),
        }));
      },

      updateReservation: (id, updates) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
          lastUpdate: Date.now(),
        }));
      },

      deleteReservation: (id) => {
        set((state) => ({
          reservations: state.reservations.filter((r) => r.id !== id),
          lastUpdate: Date.now(),
        }));
      },

      /** ====== Create (DB) ====== */
      createReservationOnServer: async (payload) => {
        const sb = getSupabase();
        const { data: auth } = await sb.auth.getSession();
        const uid = auth.session?.user?.id;
        if (!uid) throw new Error("로그인이 필요합니다.");

        // user_name은 프로필의 name이 있으면 우선, 없으면 이메일로
        const userName =
          (auth.session?.user?.user_metadata as any)?.name ??
          auth.session?.user?.email ??
          "";

        const insertBody = {
          car_id: payload.carId,
          user_id: uid,                        // RLS 충족
          user_name: userName,
          start_time: payload.startTime,
          end_time: payload.endTime,
          purpose: payload.purpose ?? null,
          destination: payload.destination ?? null,
          is_direct: payload.isDirect ?? false,
          passengers: payload.passengers ?? [],
        };

        const { data, error } = await sb
          .from("reservations")
          .insert([insertBody])
          .select("*")
          .single<DBReservation>();

        if (error) throw error;
        const created = mapDBToModel(data);
        // 낙관적 갱신 (Realtime이 있어도 UX 좋게)
        get().addReservation(created);
        return created;
      },

      /** ====== Update (DB) ====== */
      updateReservationOnServer: async (id, updates) => {
        const sb = getSupabase();
        const patch: Partial<DBReservation> = {
          car_id: updates.carId,
          start_time: updates.startTime,
          end_time: updates.endTime,
          purpose: updates.purpose ?? null,
          destination: updates.destination ?? null,
          is_direct: updates.isDirect,
          passengers: updates.passengers,
        };

        // undefined 필드는 제거 (불필요한 null 업데이트 방지)
        Object.keys(patch).forEach((k) => {
          const key = k as keyof typeof patch;
          if (typeof patch[key] === "undefined") delete patch[key];
        });

        const { data, error } = await sb
          .from("reservations")
          .update(patch)
          .eq("id", id)
          .select("*")
          .single<DBReservation>();

        if (error) throw error;
        const updated = mapDBToModel(data);
        get().updateReservation(id, updated); // 로컬 반영
        return updated;
      },

      /** ====== Delete (DB) ====== */
      deleteReservationOnServer: async (id) => {
        const sb = getSupabase();

        // 낙관적 삭제(롤백 대비 백업)
        const prev = get().reservations;
        set({ reservations: prev.filter((r) => r.id !== id), lastUpdate: Date.now() });

        const { error } = await sb.from("reservations").delete().eq("id", id);
        if (error) {
          // 롤백
          set({ reservations: prev, lastUpdate: Date.now() });
          throw error;
        }
      },
    }),
    {
      name: "car-reservations",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
