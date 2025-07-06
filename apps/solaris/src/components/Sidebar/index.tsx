import {
  Home,
  Users,
  MessageSquare,
  Bell,
  Video,
  Image as ImageIcon,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/Button";
import { cn, getUserSlug } from "@/libs/utils";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { getPlaceholder } from "@/libs/blur";

const Sidebar = () => {
  const SidebarTrans = useTranslations("Sidebar");
  const menuItems = [
    { icon: Home, label: SidebarTrans("Home"), active: true },
    { icon: Users, label: SidebarTrans("Friends"), count: 12 },
    { icon: MessageSquare, label: SidebarTrans("Messages"), count: 3 },
    { icon: Bell, label: SidebarTrans("Notifications"), count: 5 },
    { icon: Video, label: SidebarTrans("Watch") },
    { icon: ImageIcon, label: SidebarTrans("Photos") },
    { icon: Calendar, label: SidebarTrans("Events") },
  ];

  const { user } = useAuth();
  return (
    <div className="p-4 h-full dark:text-white">
      <div className="space-y-2">
        {/* Profile Section */}
        <div className="p-4 dark:bg-zinc-950 bg-white dark:text-white rounded-2xl shadow-sm mb-6">
          <div className="flex items-center space-x-3">
            <Image
              src={user?.picture ?? "/user.png"}
              alt={user?.name ?? "Misterioso(a)"}
              className="rounded-full ring-1 ring-orange-500 hover:ring-orange-400 transition-all duration-300"
              width={48}
              loading="lazy"
              placeholder="blur"
              blurDataURL={`data:image/png;base64,${getPlaceholder(user?.picture || "/user.png")}`}
              height={48}
            />
            <div>
              <h3 className="font-semibold dark:text-white">
                {user?.name ?? "Misterioso(a)"}
              </h3>
              <Link href={getUserSlug(user?.normalized_name ?? "")}>
                <p className="text-sm text-slate-500 cursor-pointer">
                  Ver seu perfil.
                </p>
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
                item.active
                  ? cn(
                      "bg-gradient-to-r",
                      "light:from-orange-500 light:to-orange-600",
                      "dark:from-orange-400 dark:to-orange-500",
                      "shadow-sm",
                    )
                  : cn(
                      "light:hover:bg-orange-50 dark:hover:bg-orange-950/30",
                      "light:text-orange-500 light:hover:text-orange-700",
                      "dark:text-orange-300 dark:hover:text-orange-400",
                    ),
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 mr-3",
                  item.active
                    ? "light:text-white dark:text-black"
                    : "light:text-orange-500 dark:text-orange-400",
                )}
              />
              <span className="font-medium">{item.label}</span>
              {item.count && (
                <span
                  className={cn(
                    "ml-auto text-xs rounded-full px-2 py-0.5",
                    "bg-red-500 text-white",
                  )}
                >
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
