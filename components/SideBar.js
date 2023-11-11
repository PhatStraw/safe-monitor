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
        "hidden md:flex border-r flex-col space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "p-3", "m-0",
            {
                "bg-primary text-white": pathname === item.href, // Change these classes to suit your design
                "hover:bg-primary hover:text-white hover:opacity-70": pathname !== item.href,
            }
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}