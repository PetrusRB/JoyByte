"use client";

import { Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/Button";
import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo } from "react";
import { slugToSearchQuery } from "@/libs/utils";
import { useRouter } from "next/navigation";
import { UserProfile } from "@hexagano/backend";
import { usePathname } from "next/navigation";
import { useRandomUsers } from "@/hooks/useRandomUsers";
import { useAuth } from "@/contexts/auth/AuthContext";

interface WhoFollowListProps {
  translation: any;
  style?: React.CSSProperties;
}

// Componente de Loading
const LoadingState = memo(() => {
  return (
    <div className="flex items-center space-x-3 p-2 animate-pulse">
      <div className="w-10 h-10 bg-slate-200 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </div>
    </div>
  );
});

LoadingState.displayName = "LoadingState";

// Componente de Error otimizado
const ErrorState = memo(({ error }: { error: string }) => {
  return (
    <div className="flex items-center justify-center p-4 text-red-500 bg-red-50 rounded-lg">
      <p className="text-sm">{error}</p>
    </div>
  );
});

ErrorState.displayName = "ErrorState";

// Componente de Empty State otimizado
const EmptyState = memo(() => {
  const t = useTranslations("User");
  return (
    <div className="flex items-center justify-center p-4 text-gray-400">
      <p className="text-sm">{t("No users to follow")}</p>
    </div>
  );
});

EmptyState.displayName = "EmptyState";

// Componente de User Item
const UserItem = memo(
  ({ user, onClick }: { user: UserProfile; onClick: () => void }) => (
    <div
      onClick={onClick}
      className="flex items-center space-x-3 p-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]"
    >
      <div className="relative">
        <img
          loading="lazy"
          src={user.picture ?? "/user.png"}
          alt={user.name ?? "Misterioso(a)"}
          className="w-10 h-10 rounded-full border-2 border-slate-200"
        />
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium dark:text-white hover:text-orange-600 text-gray-600 truncate">
          {user.name}
        </p>
        <p className="text-sm text-green-600">Online</p>
      </div>
    </div>
  ),
);

UserItem.displayName = "UserItem";

const WhoFollowList = memo(({ style, translation }: WhoFollowListProps) => {
  const router = useRouter();
  const path = usePathname();
  const { user } = useAuth();

  const {
    duplicates: queryRandDuplicates,
    error: queryRandError,
    loading: queryRandLoading,
  } = useRandomUsers(user);
  const goto = useCallback(
    (user: UserProfile) => {
      if (!user?.normalized_name) return;
      const slugProfile = slugToSearchQuery(user.normalized_name);
      router.push(`/user/${slugProfile.replace(" ", ".")}`);
    },
    [router],
  );

  // Renderização condicional otimizada
  const renderContent = useMemo(() => {
    if (queryRandLoading) {
      return Array.from({ length: 3 }, (_, i) => <LoadingState key={i} />);
    }

    if (queryRandError) {
      return <ErrorState error={queryRandError} />;
    }

    if (!queryRandDuplicates?.length) {
      return <EmptyState />;
    }

    return queryRandDuplicates.map((user) => (
      <UserItem
        key={user.name || user.id}
        user={user}
        onClick={() => goto(user)}
      />
    ));
  }, [queryRandDuplicates, queryRandError, queryRandLoading, goto]);

  if (path !== "/") return null;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-4 h-full dark:text-white text-gray-600">
          <div className="dark:text-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {translation("Who to follow")}
              </h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-8 h-8 hover:bg-orange-200 dark:hover:bg-zinc-800"
                >
                  <Search className="w-4 h-4 dark:text-white text-orange-700" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-8 h-8 hover:bg-orange-200 dark:hover:bg-zinc-800"
                >
                  <MoreHorizontal className="w-4 h-4 dark:text-white text-orange-700" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">{renderContent}</div>
          </div>
        </div>
      </div>
    </aside>
  );
});

WhoFollowList.displayName = "WhoFollowList";
export default WhoFollowList;
