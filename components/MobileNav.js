"use client";
import Nav from "../components/Nav";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  {
    to: "/dashboard",
    label: "Home",
    icon: (
        <svg
        className=" h-6 w-6 text-gray-500"
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
        className=" h-6 w-6 text-gray-500"
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
  },
  // {
  //   to: "/dashboard/comments",
  //   label: "Comments",
  //   icon: (
  //       <svg
  //         className=" h-6 w-6 "
  //         fill="none"
  //         height="24"
  //         stroke="currentColor"
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //         strokeWidth="2"
  //         viewBox="0 0 24 24"
  //         width="24"
  //         xmlns="http://www.w3.org/2000/svg"
  //       >
  //         <circle cx="11" cy="11" r="8" />
  //         <path d="m21 21-4.3-4.3" />
  //       </svg>
  //   )
  // },
  // {
  //   to: "/dashboard/likes",
  //   label: "Likes",
  //   icon: (
  //       <svg
  //       className=" h-6 w-6 text-gray-500"
  //       fill="none"
  //       height="24"
  //       stroke="currentColor"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //       strokeWidth="2"
  //       viewBox="0 0 24 24"
  //       width="24"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <rect height="16" rx="2" width="20" x="2" y="4" />
  //       <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  //     </svg>
  //   )
  // },
  // {
  //   to: "/dashboard/subscriptions",
  //   label: "Subs",
  //   icon: (
  //       <svg
  //       className=" h-6 w-6 "
  //       fill="none"
  //       height="24"
  //       stroke="currentColor"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //       strokeWidth="2"
  //       viewBox="0 0 24 24"
  //       width="24"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
  //       <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  //     </svg>
  //   )
  // },
];

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/vNX8yq9K5xS
 */
export default function MobileNav() {
  const pathname = usePathname();
  const [isToggled, setIsToggled] = useState(false);
  const [session, setSession] = useState(null);
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
        className={`flex flex-col min-w-[50%] p-2 text-gray-500 items-center ${
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
