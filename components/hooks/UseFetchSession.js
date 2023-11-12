'use client'
import { useState, useEffect } from 'react';

const useSession = () => {
  const [session, setSession] = useState();

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch('/api/session');
      const data = await res.json();
      setSession(data.session);
      console.log(data)
    };

    fetchSession();
  }, []);

  return session;
};

export default useSession