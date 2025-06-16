import React from 'react';
import Link from 'next/link';
import { Home, User, MessageCircle, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';

const items = [
  { icon: <Home />, href: '/' },
  { icon: <MessageCircle />, href: '/messages' },
  { icon: <Menu />, href: '#' },
  { icon: <User />, href: `/user/:user` },
];

export default function MobileNav() {
  const {isAuthenticated, user} = useAuth();
  if (!isAuthenticated){
    return null;
  }
  return (
    <nav className="fixed bottom-0 w-full bg-zinc-950/30 backdrop-blur-md shadow-inner py-2 flex justify-around lg:hidden">
      {items.map((item, i) => (
        <Link key={i} href={item.href.replace(":user", user?.user_metadata?.name)} className="text-white hover:scale-50 transition-transform hover:text-yellow-500">
          {item.icon}
        </Link>
      ))}
    </nav>
  );
}
