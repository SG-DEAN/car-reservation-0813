"use client"

import { useState } from "react"
import { LogOut, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { LoginDialog } from "@/components/login-dialog"
import Link from "next/link"

export function UserNav() {
  const { user, signOut } = useAuth()
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const label =
    (user?.name?.trim() ||
     user?.login_id?.toString().trim() ||
     user?.email?.toString().trim() ||
     "User");
  const initials = label.slice(0, 2).toUpperCase();

  if (!user) {
    return (
      <>
        <Button variant="outline" onClick={() => setIsLoginDialogOpen(true)}>
          로그인
        </Button>
        <LoginDialog externalOpen={isLoginDialogOpen} onExternalOpenChange={setIsLoginDialogOpen} />
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{label}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.department ?? ""}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
         <Link href="/profile">
          <User className="mr-2 h-4 w-4" />
          <span>프로필</span>
         </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
         <Link href="/settings">
          <Settings className="mr-2 h-4 w-4" />
          <span>설정</span>
         </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
