'use client';
import React, { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import useFetchSession from '@/components/hooks/UseFetchSession';

export default function Return() {
const session = useFetchSession();
  const [customerEmail, setCustomerEmail] = useState('');
console.log(session)
  useEffect(() => {
    if(session?.user?.email){
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const sessionId = urlParams.get('session_id');
    
        fetch(`/api/checkout_sessions?session_id=${sessionId}&user_email=${session?.user?.email}`, {
          method: "GET",
        })
          .then((res) => res.json())
          .then((data) => {
            setCustomerEmail(data.customer_email);
            console.log("======DATA======", data)
          });
    }
  }, [session?.user?.email]);

//   if (status !== 200) {
//     return (
//       redirect('/')
//     )
//   }

if (customerEmail) {
    setTimeout(() => {
      redirect('/dashboard/profile'); // specify the path you want to redirect to
    }, 8000);
  
    return (
      <section id="success" className='w-full'>
        <p className='w-full text-center'>
          We appreciate your business! A confirmation email will be sent to {customerEmail}.
  
          If you have any questions, please email <a href="mailto:kevindsimsjr@gmail.com">kevindsimsjr@gmail.com</a>.
        </p>
      </section>
    )
  }

  return null;
}