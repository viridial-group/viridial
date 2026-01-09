"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined)

interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
}

const TooltipProvider = ({ children }: TooltipProviderProps) => {
  return <>{children}</>
}

interface TooltipProps {
  children: React.ReactNode
  delayDuration?: number
}

const Tooltip = ({ children }: TooltipProps) => {
  const [open, setOpen] = React.useState(false)

  const contextValue = React.useMemo<TooltipContextValue>(
    () => ({
      open,
      setOpen,
    }),
    [open, setOpen]
  )

  return <TooltipContext.Provider value={contextValue}>{children}</TooltipContext.Provider>
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
  children: React.ReactNode
}

const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ asChild, children, className, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const context = React.useContext(TooltipContext)
    if (!context) {
      throw new Error("TooltipTrigger must be used within Tooltip")
    }

    const handleMouseEnter = React.useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        context.setOpen(true)
        onMouseEnter?.(e)
      },
      [context, onMouseEnter]
    )

    const handleMouseLeave = React.useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        context.setOpen(false)
        onMouseLeave?.(e)
      },
      [context, onMouseLeave]
    )

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        className: cn(className, children.props.className),
        ...props,
      } as any)
    }

    return (
      <div
        ref={ref}
        className={cn("relative inline-block", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = "top", sideOffset = 4, align = "center", children, ...props }, ref) => {
    const context = React.useContext(TooltipContext)
    if (!context) {
      throw new Error("TooltipContent must be used within Tooltip")
    }

    if (!context.open) {
      return null
    }

    const sideClasses = {
      top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      right: "left-full top-1/2 -translate-y-1/2 ml-2",
      bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
      left: "right-full top-1/2 -translate-y-1/2 mr-2",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 whitespace-normal max-w-xs overflow-hidden rounded-md border bg-gray-900 px-3 py-1.5 text-sm text-white shadow-lg",
          sideClasses[side],
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
        style={{ marginTop: side === "bottom" ? sideOffset : undefined, marginBottom: side === "top" ? sideOffset : undefined, marginLeft: side === "right" ? sideOffset : undefined, marginRight: side === "left" ? sideOffset : undefined }}
        onMouseEnter={() => context.setOpen(true)}
        onMouseLeave={() => context.setOpen(false)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

