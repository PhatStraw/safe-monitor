import Head from 'next/head';

const CustomHead = ({ 
  description = "Safe Monitor - Stay informed about your child's online activities with our intuitive and secure monitoring tool.",
  imageUrl = "/default-social-image.jpg",
  url = "https://safe-monitor.vercel.app/", 
}) => {
  const fullTitle = 'Safe Monitor' 

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl} />

      {/* Add additional SEO tags as needed */}
    </Head>
  );
};

export default CustomHead;
