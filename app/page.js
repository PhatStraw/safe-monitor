"use client";
import CallToAction from "@/components/CallToAction";
import Features from "@/components/Features";
import HomeFooter from "@/components/HomeFooter";
import HomeHero from "@/components/HomeHero";
import Testimonials from "@/components/Testimonials";
import useFetchSession from "@/components/hooks/UseFetchSession";
import CustomHead from "@/components/CustomHead";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const session = useFetchSession();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams;
    
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
      <CustomHead />
      <HomeHero />
      <Features />
      <Testimonials />
      <CallToAction />
      <HomeFooter />
    </>
  );
}
