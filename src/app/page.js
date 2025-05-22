"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const who = localStorage.getItem('who');

    if (who === 'admin') {
      router.push('/admin');
    } else if (who === 'user') {
      router.push('/user');
    }
  }, [router]);

  return <>resetart app</>;
}
