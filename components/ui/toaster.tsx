"use client"

import { useToast } from "./use-toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  // 가장 간단한 토스트 UI 예시 (디자인은 입맛대로)
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        minWidth: 320,
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: toast.variant === "destructive" ? "#fee2e2" : "#fff",
            color: "#111",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 2px 12px #0001",
            padding: "16px 20px",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ flex: 1 }}>
            {toast.title && <div style={{ fontWeight: 700, marginBottom: 4 }}>{toast.title}</div>}
            {toast.description && <div style={{ fontSize: 14 }}>{toast.description}</div>}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            style={{
              background: "none",
              border: "none",
              color: "#888",
              fontSize: 18,
              marginLeft: 8,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
