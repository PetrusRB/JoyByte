import { Home, Users, MessageSquare, Bell, Video, Image as ImageIcon, Calendar } from "lucide-react";
import { Button } from "@/components/Button";
import { cn, slugToSearchQuery } from "@/libs/utils";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {Image} from "antd";

const Sidebar = () => {
    const SidebarTrans = useTranslations("Sidebar");
    const menuItems = [
        { icon: Home, label: SidebarTrans('Home'), active: true },
        { icon: Users, label: SidebarTrans('Friends'), count: 12 },
        { icon: MessageSquare, label: SidebarTrans("Messages"), count: 3 },
        { icon: Bell, label: SidebarTrans("Notifications"), count: 5 },
        { icon: Video, label: SidebarTrans("Watch") },
        { icon: ImageIcon, label: SidebarTrans("Photos") },
        { icon: Calendar, label: SidebarTrans("Events") }
    ];

    const { user } = useAuth();
    const slugProfile = slugToSearchQuery(user?.name??"");
    return (
        <div className="p-4 h-full dark:text-white">
            <div className="space-y-2">
                {/* Profile Section */}
                <div className="p-4 dark:bg-black bg-white dark:text-white rounded-2xl shadow-sm mb-6">
                    <div className="flex items-center space-x-3">
                      <Image
                      src={user?.picture??"/user.png"}
                      alt={user?.name??"Misterioso(a)"}
                      className="rounded-full ring-1 ring-orange-500 hover:ring-orange-400 transition-all duration-300"
                      width={48}
                      height={48}
                      />
                        <div>
                            <h3 className="font-semibold dark:text-white">{user?.name??"Misterioso(a)"}</h3>
                            <Link href={"/user/:user".replace(":user", slugProfile.replace(' ', '.'))}>
                              <p className="text-sm text-slate-500 cursor-pointer">Ver seu perfil.</p>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-1">
                    {menuItems.map((item) => (
                        <Button
                            key={item.label}
                            variant="ghost"
                            className={cn(
                                "w-full justify-start h-12 px-4 rounded-xl transition-all duration-200 bg-transparent hover:scale-[1.02]",
                                item.active ? "bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-sm" : "dark:text-white text-orange-700 hover:bg-orange-100 hover:text-orange-800"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 mr-3 text-orange-700", item.active && "text-white")} />
                            <span className="font-medium">{item.label}</span>
                            {item.count && (
                                <span className={`ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5`}>
                                    {item.count}
                                </span>
                            )}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
