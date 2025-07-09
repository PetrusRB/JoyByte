"use client";

import { Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/Button";
import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo } from "react";
import { slugToSearchQuery } from "@/libs/utils";
import { useRouter } from "next/navigation";

export interface WhoFollowType {
  name: string;
  avatar: string;
}

interface WhoFollowListProps {
  whotofollow: WhoFollowType[];
}

const WhoFollowList = memo(({ whotofollow }: WhoFollowListProps) => {
  const t = useTranslations("User");
  const navigate = useRouter();

  const goto = useCallback((WhoFollowType: WhoFollowType) => {
    if (!WhoFollowType) return;
    const slugProfile = slugToSearchQuery(WhoFollowType.name ?? "");
    navigate.push(
      "/user/:user".replace(":user", slugProfile.replace(" ", ".")),
    );
  }, []);

  const renderedWhoFollow = useMemo(
    () =>
      whotofollow.map((WhoFollowProps) => (
        <div
          key={WhoFollowProps.name}
          onClick={() => goto(WhoFollowProps)}
          className="flex items-center space-x-3 p-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]"
        >
          <div className="relative">
            <img
              loading="lazy"
              src={WhoFollowProps.avatar}
              alt={WhoFollowProps.name}
              className="w-10 h-10 rounded-full border-2 border-slate-200"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium dark:text-white hover:text-yellow-600 text-gray-600 truncate">
              {WhoFollowProps.name}
            </p>
            <p className="text-sm text-green-600">Online</p>
          </div>
        </div>
      )),
    [whotofollow, goto],
  );

  return (
    <div className="p-4 h-full dark:text-white text-gray-600">
      <div className="dark:text-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            {t("Who to follow")}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-8 h-8 hover:bg-slate-100"
            >
              <Search className="w-4 h-4 text-slate-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-8 h-8 hover:bg-slate-100"
            >
              <MoreHorizontal className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">{renderedWhoFollow}</div>
      </div>
    </div>
  );
});

WhoFollowList.displayName = "WhoFollowList";
export default WhoFollowList;
