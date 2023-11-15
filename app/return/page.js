"use client";
import React, { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import useFetchSession from "@/components/hooks/UseFetchSession";

export default function Return() {
  const session = useFetchSession();
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    if (session?.user?.email) {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const sessionId = urlParams.get("session_id");

      fetch(
        `/api/checkout_sessions?session_id=${sessionId}&user_email=${session?.user?.email}`,
        {
          method: "GET",
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setCustomerEmail(data.customer_email);
        });
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (customerEmail) {
      setTimeout(() => {
        redirect("/dashboard/profile"); // specify the path you want to redirect to
      }, 5000);
    }
  }, [customerEmail]);

  if (customerEmail) {
    return (
      <section id="success" className="w-full">
        <p className="w-full text-center">
          We appreciate your business! A confirmation email will be sent to{" "}
          {customerEmail}. If you have any questions, please email{" "}
          <a href="mailto:kevindsimsjr@gmail.com">kevindsimsjr@gmail.com</a>.
        </p>
      </section>
    );
  }

  return null;
}
