import Link from "next/link";

const FeatureCard = ({ imgSrc, title, description }) => (
  <div className="group relative bg-white dark:bg-gray-800 transition hover:z-[1] hover:shadow-2xl hover:shadow-gray-600/10">
    <div className="relative space-y-8 py-12 p-8">
      <img
        src={imgSrc}
        className="w-12"
        width="512"
        height="512"
        alt="feature illustration"
      />

      <div className="space-y-2">
        <h5 className="text-xl font-semibold text-gray-700 dark:text-white transition group-hover:text-secondary">
          {title}
        </h5>
        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
      <Link
        href="/dashboard"
        className="flex items-center justify-between group-hover:text-secondary"
      >
        <span className="text-sm">Read more</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 -translate-x-4 text-2xl opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        >
          <path
            fillRule="evenodd"
            d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    </div>
  </div>
);

export default function Features() {
  return (
    <div id="features" className="max-w-7xl mb-[12rem] px-6 mx-auto">
      <div>
        <div className="text-center lg:text-start lg:w-1/2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-secondary"
          >
            {/* SVG path */}
          </svg>

          <h2 className="my-8 text-2xl font-bold text-gray-700 dark:text-white md:text-4xl">
            Empower Your Parenting with Insightful Oversight
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Embrace a smarter approach to parenting with Safe Monitor.
            Seamlessly integrate into your child&apos;s digital world, ensuring
            they&apos;re safe and sound, without overstepping.
          </p>
        </div>
        <div className="mt-12 grid divide-x divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden rounded-3xl border border-gray-100 text-gray-600 dark:border-gray-700 sm:grid-cols-2 lg:grid-cols-3 lg:divide-y-0 xl:grid-cols-3">
          <FeatureCard
            imgSrc="https://cdn-icons-png.flaticon.com/512/4341/4341139.png"
            title="In-Depth Psychological Insights"
            description="Gain a deeper understanding of how digital content influences your child&apos;s development, fostering a balanced and healthy media diet."
          />
          <FeatureCard
            imgSrc="https://cdn-icons-png.flaticon.com/512/4341/4341134.png"
            title="Concise Video Summaries"
            description="Stay informed with brief, insightful summaries of the videos your child watches, saving you time while keeping you connected."
          />
          <FeatureCard
            imgSrc="https://cdn-icons-png.flaticon.com/512/4341/4341025.png"
            title="Creator Insights"
            description="Understand the creators shaping your child&apos;s views, ensuring they&apos;re following positive and enriching influencers."
          />
        </div>
      </div>
    </div>
  );
}