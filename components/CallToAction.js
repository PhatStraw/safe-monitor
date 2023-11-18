import Link from "next/link";

export default function CallToAction() {
  return (
    <div className="grid grid-cols-1 gap-6  mb-[9rem] md:grid-cols-3 md:gap-8 mx-5 md:mx-10 lg:mx-[50rem]">
    <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300">
      <div>
        <h3 className="text-2xl font-bold text-center">Basic</h3>
        <div className="mt-4 text-center text-zinc-600 dark:text-zinc-400">
          <span className="text-4xl font-bold">$5</span>/ month
        </div>
        <ul className="mt-4 space-y-2">
          <li className="flex items-center">
            <svg
              className=" text-white text-xs bg-green-500 rounded-full mr-2 p-1"
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Weekly Updates on your childs youtube activity via Email
          </li>
        </ul>
      </div>
      <div className="mt-6 text-center w-full text-center p-1 rounded bg-primary text-white">
        <Link href="/dashboard" className="w-full text-white">Get Started</Link>
      </div>
    </div>
    <div className="relative flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-purple-500">
      <div className="px-3 py-1 text-sm text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full inline-block absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        Popular
      </div>
      <div>
        <h3 className="text-2xl font-bold text-center">Pro</h3>
        <div className="mt-4 text-center text-zinc-600 dark:text-zinc-400">
          <span className="text-4xl font-bold">$10</span>/ month
        </div>
        <ul className="mt-4 space-y-2">
          <li className="flex items-center">
            <svg
              className=" text-white text-2xs bg-green-500 rounded-full mr-2 p-1"
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Basic
          </li>
          <li className="flex items-center">
            <svg
              className=" text-white text-xs bg-green-500 rounded-full mr-2 p-1"
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Access to our monitoring app
          </li>
          <li className="flex items-center">
            <svg
              className=" text-white text-xs bg-green-500 rounded-full mr-2 p-1"
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            visuals of your childs actvity
          </li>
        </ul>
      </div>
      <div className="mt-6 text-center w-full text-center p-1 rounded bg-gradient-to-r from-pink-500 to-purple-500 text-white">
        <Link href="/dashboard" className="w-full text-center text-white">Get Started</Link>
      </div>
    </div>
    <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300">
      <div>
        <h3 className="text-2xl font-bold text-center">Coming Soon</h3>
        <div className="mt-4 text-center text-zinc-600 dark:text-zinc-400">
          <span className="text-4xl font-bold">$20</span>/ month
        </div>
        <ul className="mt-4 space-y-2">
          <li className="flex items-center">
            <svg
              className=" text-white text-xs bg-green-500 rounded-full mr-2 p-1"
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Basic
          </li>
          <li className="flex items-center">
            <svg
              className=" text-white text-xs bg-green-500 rounded-full mr-2 p-1"
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Pro
          </li>
          <li className="flex items-center">
            <svg
              className=" text-white text-xs bg-green-500 rounded-full mr-2 p-1"
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Monitor discord
          </li>
          <li className="flex items-center">
            <svg
              className=" text-white text-xs bg-green-500 rounded-full mr-2 p-1"
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Monitor Tiktoc
          </li>
        </ul>
      </div>
      <div className="mt-6 mt-6 text-center w-full text-center p-1 rounded bg-primary text-white">
        <Link href="/dashboard" className="w-full text-white">Get Started</Link>
      </div>
    </div>
  </div>
  );
}
