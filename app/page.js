"use client";
import Features from "@/components/Features";
import useFetchSession from "@/components/hooks/UseFetchSession";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const session = useFetchSession();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams;
    console.log(code);
    if (
      code.size > 0 &&
      session?.user.email &&
      session.user.email.endsWith(".com")
    ) {
      redirect(`/dashboard/profile?${code}`);
    }
  }, [session?.user.email]);

  return (
    <>
      <div className="relative" id="home">
        <div
          aria-hidden="true"
          className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
        >
          <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 dark:from-blue-700"></div>
          <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300 dark:to-indigo-600"></div>
        </div>
        <div className="max-w-7xl mb-[14rem] mx-auto px-6 md:px-12 xl:px-6">
          <div className="relative pt-36 ml-auto">
            <div className="lg:w-2/3 text-center mx-auto">
              <h1 className="text-gray-900 dark:text-white font-bold text-5xl md:text-6xl xl:text-7xl">
                Keeping You Cool and{" "}
                <span className="text-primary dark:text-primary">
                  Your Kids Safe.
                </span>
              </h1>
              <p className="mt-8 text-gray-700 dark:text-gray-300">
                No more guessing games or feeling out of touch. Our newsletter
                provides you with valuable insights and information, ensuring
                youre aware of the videos and channels your child is engaging
                with.
              </p>

              <div className="mt-16 flex flex-wrap justify-center gap-y-4 gap-x-6">
                <Link
                  className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
                  href="/dashboard"
                >
                  <span className="relative text-base font-semibold text-white">
                    Get started
                  </span>
                </Link>
                <Link
                  href="/dashboard"
                  className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-primary/10 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-gray-700 dark:before:bg-gray-800 sm:w-max"
                >
                  <span className="relative text-base font-semibold text-primary dark:text-white">
                    Learn more
                  </span>
                </Link>
              </div>
              <div className="hidden py-8 mt-16 border-y border-gray-100 dark:border-gray-800 sm:flex justify-between">
                <div className="text-left">
                  <h6 className="text-lg font-semibold text-gray-700 dark:text-white">
                    Unbeatable Value
                  </h6>
                  <p className="mt-2 mr-2 text-gray-500">
                    Experience top-tier child monitoring at the most affordable
                    price. Get premium features without stretching your budget.
                  </p>
                </div>
                <div className="text-left">
                  <h6 className="text-lg font-semibold text-gray-700 dark:text-white">
                    Lightning-Fast Setup
                  </h6>
                  <p className="mt-2 mr-4 text-gray-500">
                    Jumpstart your journey to smarter parenting in no time.
                    Register now and receive your first insightful update in
                    under an hour!
                  </p>
                </div>
                <div className="text-left">
                  <h6 className="text-lg font-semibold text-gray-700 dark:text-white">
                    Globally Trusted by Parents
                  </h6>
                  <p className="mt-2 mr-4 text-gray-500">
                    Join a worldwide community of satisfied parents who trust us
                    to add value, insight, and peace of mind to their parenting
                    experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Features />
    </>
  );
}
