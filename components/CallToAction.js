import Link from "next/link";

export default function CallToAction() {
  return (
    <div className="mt-6 mb-[14rem] mx-6 md:mx-[7rem]  m-auto space-y-6">
      <h1 className="text-center text-4xl font-bold text-gray-800 dark:text-white md:text-5xl">
        Get Started now
      </h1>
      <p className="text-center text-xl text-gray-600 dark:text-gray-300">
        Be part of millions people around the world using Safe Monitor
      </p>
      <div className="flex flex-wrap justify-center gap-6">
        <Link
          href="/dashboard"
          className="relative flex h-12 w-full items-center justify-center px-8 before:absolute before:inset-0 before:rounded-full before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
        >
          <span className="relative text-base font-semibold text-white dark:text-dark">
            Get started
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="relative flex h-12 w-full items-center justify-center px-8 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-primary/10 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-gray-700 dark:before:bg-gray-800 sm:w-max"
        >
          <span className="relative text-base font-semibold text-primary dark:text-white">
            Learn more
          </span>
        </Link>
      </div>
    </div>
  );
}
