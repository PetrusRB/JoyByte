import React from 'react';
import Link from 'next/link';
import { Home, User, MessageCircle, Menu } from 'lucide-react';

const items = [
  { icon: <Home />, href: '/' },
  { icon: <MessageCircle />, href: '/messages' },
  { icon: <Menu />, href: '#' },
  { icon: <User />, href: '/profile' },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 w-full bg-zinc-950 shadow-inner py-2 flex justify-around lg:hidden">
      {items.map((item, i) => (
        <Link key={i} href={item.href} className="text-gray-600 hover:text-yellow-500">
          {item.icon}
        </Link>
      ))}
    </nav>
  );
}