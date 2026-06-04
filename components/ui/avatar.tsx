"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const AvatarContext = React.createContext<{
  imageStatus: "idle" | "loading" | "loaded" | "error"
  onLoad: () => void
  onError: () => void
} | null>(null)

function useAvatarContext() {
  const ctx = React.useContext(AvatarContext)
  if (!ctx) throw new Error("AvatarImage and AvatarFallback must be used within Avatar")
  return ctx
}

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "sm" | "lg"
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, ...props }, ref) => {
    const [imageStatus, setImageStatus] = React.useState<"idle" | "loading" | "loaded" | "error">("idle")

    return (
      <AvatarContext.Provider
        value={{
          imageStatus,
          onLoad: () => setImageStatus("loaded"),
          onError: () => setImageStatus("error"),
        }}
      >
        <div
          ref={ref}
          className={cn("relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full", className)}
          {...props}
        />
      </AvatarContext.Provider>
    )
  }
)
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, alt = "", onLoad, onError, ...props }, ref) => {
    const ctx = useAvatarContext()

    if (ctx.imageStatus === "error") return null

    return (
      <img
        ref={ref}
        alt={alt}
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
        onLoad={(e) => {
          ctx.onLoad()
          onLoad?.(e)
        }}
        onError={(e) => {
          ctx.onError()
          onError?.(e)
        }}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const ctx = useAvatarContext()

    if (ctx.imageStatus === "loaded") return null

    return (
      <div
        ref={ref}
        className={cn(
          "absolute inset-0 flex h-full w-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground",
          className
        )}
        {...props}
      />
    )
  }
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
