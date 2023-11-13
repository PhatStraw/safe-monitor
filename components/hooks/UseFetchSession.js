'use client'
import { useState, useEffect } from 'react';

const useFetchSession = () => {
  const [session, setSession] = useState();

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch('/api/session');
      const data = await res.json();
      console.log("DATA=====",data)
      setSession(data.data);
    };

    fetchSession();
  }, []);
  return session;
};

export default useFetchSession