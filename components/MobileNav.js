"use client";
import Nav from "../components/Nav";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/vNX8yq9K5xS
 */
export default function MobileNav() {
  const pathname = usePathname();
  const [isToggled, setIsToggled] = useState(false);
  const [session, setSession] = useState(null);
  const links = [
    {
      to: "/dashboard",
      label: "Home",
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
      )
    },
    {
      to: "/dashboard/profile",
      label: "Profile",
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
      )
    }
  ];
  
  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch("/api/session");
      const data = await res.json();
      setSession(data.session);
    };
    fetchSession();
  }, []);

  return (
    <div className="fixed md:hidden bottom-0 w-full  bg-white dark:bg-gray-800 shadow-md flex items-end">
      {links.map((link) => (
      <Link
        key={link.label}
        href={link.to}
        className={`flex flex-col min-w-[50%] p-2 text-gray-900 items-center ${
          pathname === link.to ? "bg-primary text-white" : ""
        } ${
          pathname !== link.to
            ? "hover:bg-primary hover:text-white hover:opacity-70"
            : ""
        }`}
      >
        {link.icon}
        <span className="text-sm ">{link.label}</span>
      </Link>

      ))}
    </div>
  );
}
