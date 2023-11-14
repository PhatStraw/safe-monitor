"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function Sidebar({ className, ...props }) {
  const pathname = usePathname();
  const items = [
    {
      href: "/dashboard",
      title: "Home",
      icon: (
        <svg
          className={
            pathname === "/dashboard"
              ? "h-6 w-6 text-white"
              : "h-6 w-6 text-black"
          }
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      href: "/dashboard/profile",
      title: "Profile",
      icon: (
        <svg
          className={
            pathname === "/dashboard/profile"
              ? "h-6 w-6 text-white"
              : "h-6 w-6 text-black"
          }
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];
  
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
            "px-3",
            "py-2",
            "flex",
            "justify-center",
            "w-56",
            "text-center",
            "mx-4",
            "my-4",
            "rounded-xl",
            "text-xl",
            {
              "bg-primary text-white": pathname === item.href, // Change these classes to suit your design
              "hover:bg-primary hover:text-white hover:opacity-70":
                pathname !== item.href,
            }
          )}
        >
          {item.icon} {item.title}
        </Link>
      ))}
    </nav>
  );
}
