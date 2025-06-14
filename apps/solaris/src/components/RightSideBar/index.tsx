import Image from 'next/image';
import React from 'react';

const friends = [
    { uid: '1', name: 'Yakuza', photoUrl: "" },
    { uid: '2', name: 'Pedro', photoUrl: "" },
    { uid: '3', name: 'Maria', photoUrl: "" },
];

export default function RightSidebar() {
    return (
        <aside className="hidden lg:flex lg:flex-col w-64 pt-6 px-4">
            {/* Amigos online */}
            <ul className="bg-white dark:bg-zinc-950 dark:text-white text-gray-600 rounded-lg p-4 shadow-lg space-y-4">
            <h2 className="text-lg font-semibold mb-4">Amigos Online</h2>
                {/* Mapear lista de amigos online */}
                {friends.map((item) => (
                    <li key={item.uid} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 hover:text-black transition">
                        <Image
                            src={item.photoUrl || "/user.png"}
                            alt={item.name}
                            width={36}
                            height={36}
                            className="rounded-full"
                        />
                        <span className="font-medium">{item.name}</span>
                    </li>
                ))}
            </ul>
        </aside>
    );
}