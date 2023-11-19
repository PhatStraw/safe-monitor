import Link from "next/link";

const PricingCard = ({ title, price, features, popular, comingSoon }) => (
  <div className={`relative flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between border ${popular ? 'border-purple-500' : 'border-gray-300'}`}>
    {popular && (
      <div className="px-3 py-1 text-sm text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full inline-block absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        Popular
      </div>
    )}
    <div>
      <h3 className="text-2xl font-bold text-center">{title}</h3>
      {!comingSoon && (
        <div className="mt-4 text-center text-zinc-600 dark:text-zinc-400">
          <span className="text-4xl font-bold">${price}</span>/ month
        </div>
      )}
      <ul className="mt-4 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
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
            {feature}
          </li>
        ))}
      </ul>
    </div>
    <div className={`mt-6 text-center w-full text-center p-1 rounded ${popular ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-primary'} text-white`}>
      <Link href="/dashboard" className="w-full text-white">Get Started</Link>
    </div>
  </div>
);

export default function CallToAction() {
  return (
    <div className="grid grid-cols-1 gap-6  mb-[9rem] md:grid-cols-3 md:gap-8 mx-5 md:mx-10 lg:mx-[50rem]">
      <PricingCard
        title="Basic"
        price={5}
        features={["Weekly Updates on your child's youtube activity via Email"]}
      />
      <PricingCard
        title="Pro"
        price={10}
        popular
        features={["Basic", "Access to our monitoring app", "Visuals of your child's activity"]}
      />
      <PricingCard
        title="Coming Soon"
        comingSoon
        features={["Basic", "Pro", "Monitor discord", "Monitor TikTok"]}
      />
    </div>
  );
}