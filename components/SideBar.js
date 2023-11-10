"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"



export function Sidebar({ className, items, ...props }) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "flex flex-col space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 border-r",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "p-3",
            {
                "bg-primary text-white": pathname === item.href, // Change these classes to suit your design
                "hover:bg-transparent hover:underline": pathname !== item.href,
            }
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}