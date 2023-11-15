'use client'
import { useState, useEffect } from 'react';

const useActiveUser = (email) => {
  const [user, setUser] = useState();

  useEffect(() => {
    const activeUser = async () => {
      const res = await fetch('/api/user', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      setUser(data.user);
    };

    activeUser();
  }, [email]);
  return user;
};

export default useActiveUser