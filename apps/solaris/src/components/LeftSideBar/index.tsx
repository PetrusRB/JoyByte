import React from 'react';
import Link from 'next/link';
import { Home, User, MessageCircle, Users, Settings } from 'lucide-react';

const menu = [
  { name: 'Home', icon: <Home />, href: '/' },
  { name: 'Perfil', icon: <User />, href: '/profile' },
  { name: 'Mensagens', icon: <MessageCircle />, href: '/messages' },
  { name: 'Grupos', icon: <Users />, href: '/groups' },
  { name: 'Configurações', icon: <Settings />, href: '/config' },
];

export default function LeftSidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 pt-6 px-4">
      <nav className="bg-white dark:bg-zinc-950 dark:text-white text-gray-600 rounded-lg p-4 shadow-lg space-y-4">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 hover:text-black transition"
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}