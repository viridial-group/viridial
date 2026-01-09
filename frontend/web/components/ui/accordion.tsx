"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionContextValue {
  value: string | null
  onValueChange: (value: string | null) => void
  type: "single" | "multiple"
  collapsible?: boolean
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined)

interface AccordionProps {
  type?: "single" | "multiple"
  collapsible?: boolean
  defaultValue?: string
  value?: string
  onValueChange?: (value: string | null) => void
  className?: string
  children: React.ReactNode
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = "single", collapsible = true, defaultValue, value: controlledValue, onValueChange, className, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string | null>(defaultValue || null)
    const value = controlledValue !== undefined ? controlledValue : internalValue
    const setValue = React.useCallback(
      (newValue: string | null) => {
        if (controlledValue === undefined) {
          setInternalValue(newValue)
        }
        onValueChange?.(newValue)
      },
      [controlledValue, onValueChange]
    )

    const contextValue = React.useMemo<AccordionContextValue>(
      () => ({
        value,
        onValueChange: (itemValue: string | null) => {
          if (type === "single") {
            setValue(itemValue === value && collapsible ? null : itemValue)
          }
        },
        type,
        collapsible,
      }),
      [value, setValue, type, collapsible]
    )

    return (
      <AccordionContext.Provider value={contextValue}>
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = "Accordion"

interface AccordionItemContextValue {
  value: string
  isOpen: boolean
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | undefined>(undefined)

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(AccordionContext)
    if (!context) {
      throw new Error("AccordionItem must be used within Accordion")
    }

    const isOpen = context.value === value

    const itemContextValue = React.useMemo<AccordionItemContextValue>(
      () => ({
        value,
        isOpen,
      }),
      [value, isOpen]
    )

    return (
      <AccordionItemContext.Provider value={itemContextValue}>
        <div
          ref={ref}
          className={cn("border-b border-gray-200", className)}
          data-value={value}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(AccordionContext)
    const itemContext = React.useContext(AccordionItemContext)
    if (!context || !itemContext) {
      throw new Error("AccordionTrigger must be used within AccordionItem")
    }

    const isOpen = itemContext.isOpen

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline text-left w-full",
          className
        )}
        onClick={() => context.onValueChange(itemContext.value)}
        aria-expanded={isOpen}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200 text-gray-500",
            isOpen && "rotate-180"
          )}
        />
      </button>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const itemContext = React.useContext(AccordionItemContext)
    if (!itemContext) {
      throw new Error("AccordionContent must be used within AccordionItem")
    }

    const isOpen = itemContext.isOpen

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden text-sm transition-all duration-200 ease-in-out",
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
          className
        )}
        {...props}
      >
        <div className={cn("pb-4 pt-0 text-gray-600")}>{children}</div>
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

