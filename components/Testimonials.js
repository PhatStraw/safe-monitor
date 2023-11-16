"use client";

export default function Testimonials() {
  const testimonialsEx = [
    {
      name: "Sarah",
      description: "Mom of Three",
      testimonial:
        "I love this app; it has helped me keep track of what my kids are watching.",
      image:
        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    },
    {
      name: "David",
      description: "Father of Two",
      testimonial:
        "This app is a game changer. It's so easy to use and really helps me stay informed about my children's online activities.",
      image:
        "https://www.gravatar.com/avatar/11111111111111111111111111111111?d=mp&f=y",
    },
    {
      name: "Emily",
      description: "Single Parent",
      testimonial:
        "Balancing work and parenting is tough, but this app makes it easier to monitor my child's digital usage with peace of mind.",
      image:
        "https://www.gravatar.com/avatar/22222222222222222222222222222222?d=mp&f=y",
    },
    {
      name: "John",
      description: "Tech-Savvy Dad",
      testimonial:
        "As someone who loves tech, I appreciate how intuitive and informative this app is. It's great for keeping tabs on my kids' digital exposure.",
      image:
        "https://www.gravatar.com/avatar/33333333333333333333333333333333?d=mp&f=y",
    },
    {
      name: "Angela",
      description: "Mother and Teacher",
      testimonial:
        "I've tried several monitoring tools, but this one stands out for its simplicity and effectiveness. It's been very helpful for my family.",
      image:
        "https://www.gravatar.com/avatar/44444444444444444444444444444444?d=mp&f=y",
    },
    {
      name: "Marcus",
      description: "Dad and Coach",
      testimonial:
        "This app isn't just a monitoring tool; it's a way for me to understand and connect with what my kids are interested in online.",
      image:
        "https://www.gravatar.com/avatar/55555555555555555555555555555555?d=mp&f=y",
    },
  ];

  return (
    <div
      className="max-w-7xl mx-auto p-3 mb-[10rem] lg:mb-[16rem] text-gray-600 dark:text-gray-300"
      id="reviews"
    >
      <div>
        <div className="mb-12 space-y-4 px-6 md:px-0">
          <h2 className="text-center lg:text-end text-2xl font-bold text-gray-800 dark:text-white md:text-4xl">
            What people are saying
          </h2>
        </div>
        <div className="md:columns-2 lg:columns-3 gap-8 space-y-8">
          {testimonialsEx.map((test, index) => (
            <div
              key={index}
              className="aspect-auto p-8 border border-gray-100 rounded-3xl bg-white dark:bg-gray-800 dark:border-gray-700 shadow-2xl shadow-gray-600/10 dark:shadow-none"
            >
              <div className="flex gap-4">
                <img
                  className="w-12 h-12 rounded-full"
                  src={test.image}
                  alt="user avatar"
                  width="400"
                  height="400"
                  loading="lazy"
                />
                <div>
                  <h6 className="text-lg font-medium text-gray-700 dark:text-white">
                    {test.name}
                  </h6>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {test.description}
                  </p>
                </div>
              </div>
              <p className="mt-8">{test.testimonial}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
