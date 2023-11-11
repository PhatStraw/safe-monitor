'use client'
import { useState, useEffect } from 'react';

const useSession = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch('/api/session');
      const data = await res.json();
      setSession(data.session);
    };

    fetchSession();
  }, []);

  return session;
};

export default useSession