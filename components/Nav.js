"use client";
import Link from "next/link";
import { useState } from "react";
import useFetchSession from "./hooks/UseFetchSession";

const Nav = () => {
  const [isToggled, setIsToggled] = useState(false);
  const session = useFetchSession();

  return (
    <header>
      <nav className=" w-full border-b border-black/5 dark:border-white/5 lg:border-transparent">
        <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-6">
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 md:gap-0 md:py-4">
            <div className="relative z-20 flex w-full justify-between md:px-0 lg:w-max">
              <Link
                href="/"
                aria-label="logo"
                className="flex items-center space-x-2"
              >
                <div aria-hidden="true" className="flex space-x-1">
                  <div className="h-4 w-4 rounded-full bg-gray-900 dark:bg-white"></div>
                  <div className="h-6 w-2 bg-primary"></div>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  Safe Monitor
                </span>
              </Link>

              <div className="relative flex max-h-10 items-center lg:hidden">
                <button
                  aria-label="humburger"
                  id="hamburger"
                  className={`relative -mr-6 p-6 ${isToggled ? "toggled" : ""}`}
                  onClick={() => setIsToggled(!isToggled)}
                  style={
                    isToggled
                      ? { transform: "translateY(1.5rem) rotate(45deg)" }
                      : {}
                  }
                >
                  <div
                    aria-hidden="true"
                    id="line"
                    className="m-auto h-0.5 w-5 rounded bg-sky-900 transition duration-300 dark:bg-gray-300"
                    style={
                      isToggled
                        ? { transform: "translateY(1.5rem) rotate(45deg)" }
                        : {}
                    }
                  ></div>
                  <div
                    aria-hidden="true"
                    id="line2"
                    className="m-auto mt-2 h-0.5 w-5 rounded bg-sky-900 transition duration-300 dark:bg-gray-300"
                    style={
                      isToggled
                        ? { transform: "translateY(-1rem) rotate(-45deg)" }
                        : {}
                    }
                  ></div>
                </button>
              </div>
            </div>
            <div
              id="navLayer"
              aria-hidden="true"
              className="fixed inset-0 z-10 h-screen w-screen origin-bottom scale-y-0 bg-white/70 backdrop-blur-2xl transition duration-500 dark:bg-gray-900/70 lg:hidden"
            ></div>
            <div
              id="navlinks"
              className="invisible absolute top-full left-0 z-20 w-full origin-top-right translate-y-1 scale-90 flex-col flex-wrap justify-end gap-6 rounded-3xl border border-gray-100 bg-white p-8 opacity-0 shadow-2xl shadow-gray-600/10 transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none lg:visible lg:relative lg:flex lg:w-7/12 lg:translate-y-0 lg:scale-100 lg:flex-row lg:items-center lg:gap-0 lg:border-none lg:bg-transparent lg:p-0 lg:opacity-100 lg:shadow-none"
              style={
                isToggled
                  ? {
                      visibility: "visible",
                      transform: "translateY(0)",
                      opacity: 1,
                    }
                  : {}
              }
            >
              <div className="w-full text-gray-600 dark:text-gray-200 lg:w-auto lg:pr-4 lg:pt-0">
                <ul
                  className="flex flex-col gap-6 tracking-wide lg:flex-row lg:gap-0 lg:text-sm"
                  onClick={() => {
                    setIsToggled(!isToggled);
                  }}
                >
                  <li>
                    <Link
                      href="/privacy"
                      className="flex gap-2 font-semibold text-gray-700 transition hover:text-primary dark:text-white dark:hover:text-white md:px-4"
                    >
                      <span>Privacy Policy</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard"
                      className="flex gap-2 font-semibold text-gray-700 transition hover:text-primary dark:text-white dark:hover:text-white md:px-4"
                    >
                      <span>App</span>
                      <span className="flex rounded-full bg-primary/20 px-1.5 py-0.5 text-xs tracking-wider text-purple-700 dark:bg-white/10 dark:text-orange-300">
                        {" "}
                        new
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mt-12 lg:mt-0">
                {session ? (
                  <Link
                    className="text-white text-xl relative flex h-9 w-full items-center justify-center px-4 before:absolute before:inset-0 before:rounded-full before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
                    href="/api/auth/signout?callbackUrl=/"
                  >
                    <span className="relative text-sm font-semibold text-white">
                      Logout
                    </span>
                  </Link>
                ) : (
                  <Link
                    className="text-white text-xl relative flex h-9 w-full items-center justify-center px-4 before:absolute before:inset-0 before:rounded-full before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
                    href="/api/auth/signin"
                  >
                    <span className="relative text-sm font-semibold text-white">
                      Login
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Nav;
