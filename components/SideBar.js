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
        "hidden md:flex shadowr-sm flex-col space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 items-center",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "px-3","py-1","flex","justify-center", "w-56","text-center", "mx-4","my-4","rounded-xl", "text-xl",
            {
                "bg-primary text-white": pathname === item.href, // Change these classes to suit your design
                "hover:bg-primary hover:text-white hover:opacity-70": pathname !== item.href,
            }
          )}
        >
          {item.icon}
          {" "}
          {item.title}
        </Link>
      ))}
    </nav>
  )
}