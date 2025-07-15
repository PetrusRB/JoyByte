"use client";
import { Bell, Menu, Search, Settings, User } from "lucide-react";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useEffect, useState } from "react";
import { Button } from "../Button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "../ui/Input";
import Link from "next/link";

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useRouter();

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
  const onMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  return (
    <>
      <header className="bg-orange-50/50 dark:bg-black/50 backdrop-blur-md ring-1 dark:ring-zinc-800 ring-orange-200/40 sticky top-0 z-50 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left - Mobile Menu + Logo */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full hover:bg-slate-100"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </Button>
            <Image
              src="/favicon.ico"
              alt="Logo"
              className="hover:scale-110 transition-transform cursor-pointer"
              onClick={() => navigate.push("/")}
              width={32}
              height={32}
              priority
            />
          </div>

          {/* Center - Search Bar (Hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-500 dark:text-slate-500" />
              <Input
                type="text"
                placeholder="Pesquisar..."
                className="w-full pl-10 pr-4 py-2 rounded-lg"
              />
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full hover:bg-slate-100"
            >
              <Search className="w-5 h-5 text-slate-600" />
            </Button>

            {/* Dynamic Action Buttons */}
            {[
              {
                icon: Bell,
                badgeColor: "bg-red-500",
                href: "/notifications",
                showBadge: true,
                tooltip: "Notifications",
              },
              {
                icon: Settings,
                href: "/settings/account",
                showBadge: false,
                tooltip: "Settings",
              },
            ].map(
              ({ icon: Icon, badgeColor, href, showBadge, tooltip }, index) => (
                <Link key={index} href={href}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex rounded-full bg-orange-50 hover:bg-orange-200 dark:bg-zinc-950 dark:hover:bg-zinc-800 relative"
                    title={tooltip}
                  >
                    <Icon className="w-5 h-5 dark:text-white text-orange-800" />
                    {showBadge && (
                      <span
                        className={`absolute -top-1 -right-1 w-3 h-3 ${badgeColor} rounded-full border-2 border-white`}
                      ></span>
                    )}
                  </Button>
                </Link>
              ),
            )}

            {/* Login Button */}
            {!isAuthenticated && (
              <Button
                onClick={() => navigate.push("/")}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full px-4 py-2 transition-all duration-200 hover:scale-105"
              >
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
