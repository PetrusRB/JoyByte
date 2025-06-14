import Link from "next/link";
import { Search, SettingsIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth/AuthContext";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';

const items: MenuProps['items'] = [
    {
        key: '1',
        label: 'Minha conta',
        disabled: true,
    },
    {
        type: 'divider',
    },
    {
        key: '2',
        label: 'Profile',
        extra: '⌘P',
    },
    {
        key: '3',
        label: 'Billing',
        extra: '⌘B',
    },
    {
        key: '4',
        label: 'Settings',
        icon: <SettingsIcon />,
        extra: '⌘S',
    },
];

const Navbar = () => {
    const { isAuthenticated, user } = useAuth();
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 768); // Adjust breakpoint as needed
        };

        handleResize(); // Initial check
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    if (!isAuthenticated || !isDesktop) {
        return null; // Não renderiza a navbar se não estiver autenticado ou em dispositivos móveis
    }

    return (
        <>
            <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 py-2">
                <div className="mx-auto max-w-7xl">
                    <nav className="relative flex items-center justify-between py-2 sm:py-3 dark:bg-zinc-950/50 dark:text-white bg-white/50 text-gray-600 backdrop-blur-lg rounded-xl px-4 sm:px-6">
                        <div className="flex items-center flex-shrink-0">
                            {/* Logo */}
                            <Link href="/" className="hover:scale-110 transition-transform duration-300">
                                <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            {/* Search Bar */}
                            <div className="flex-1 max-w-lg mx-4">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Pesquisar"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                    />
                                </div>
                            </div>
                            <div className="my-2 md:my-0 md:mx-2">
                                <div className="w-full h-px md:w-px md:h-4 bg-gray-100 md:bg-gray-300 dark:bg-neutral-700"></div>
                            </div>
                            <Dropdown menu={{ items }}>
                                <div className="w-8 h-8 rounded-full hover:scale-110 transition-transform border-transparent hover:border-gray-300 bg-gray-300 overflow-hidden">
                                    {/* Foto do usuário */}
                                    <Image src={user?.user_metadata?.picture || "/user.png"} alt="Perfil" width={32} height={32} />
                                </div>
                            </Dropdown>
                        </div>
                    </nav>
                </div>
            </header>
        </>
    );
};

export default Navbar;