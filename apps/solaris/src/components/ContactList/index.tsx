"use client";

import { Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/Button";
import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo } from "react";
import { slugToSearchQuery } from "@/libs/utils";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/schemas/user";

export interface ContactType {
  name: string;
  avatar: string;
}

interface ContactListProps {
  contacts: ContactType[];
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
        <p className="font-medium dark:text-white hover:text-yellow-600 text-gray-600 truncate">
          {user.name}
        </p>
        <p className="text-sm text-green-600">Online</p>
      </div>
    </div>
  ),
);

UserItem.displayName = "UserItem";
const ContactList = memo(({ contacts }: ContactListProps) => {
  const t = useTranslations("User");
  const navigate = useRouter();

  const goto = useCallback((ContactType: ContactType) => {
    if (!ContactType) return;
    const slugProfile = slugToSearchQuery(ContactType.name ?? "");
    navigate.push(
      "/user/:user".replace(":user", slugProfile.replace(" ", ".")),
    );
  }, []);

  const renderedContact = useMemo(
    () =>
      contacts.map((ContactProps) => (
        <div
          key={ContactProps.name}
          onClick={() => goto(ContactProps)}
          className="flex items-center space-x-3 p-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]"
        >
          <div className="relative">
            <img
              loading="lazy"
              src={ContactProps.avatar}
              alt={ContactProps.name}
              className="w-10 h-10 rounded-full border-2 border-slate-200"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium dark:text-white hover:text-yellow-600 text-gray-600 truncate">
              {ContactProps.name}
            </p>
            <p className="text-sm text-green-600">Online</p>
          </div>
        </div>
      )),
    [contacts, goto],
  );

  return (
    <div className="p-4 h-full dark:text-white text-gray-600">
      <div className="dark:text-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            {t("Contacts")}
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

        <div className="space-y-2">{renderedContact}</div>

        <div className="mt-6 p-3 dark:bg-zinc-950 bg-orange-50 dark:text-white text-orange-700 rounded-xl">
          <p className="text-sm">
            <span className="font-semibold text-green-600">
              {contacts.length}
            </span>{" "}
            {t("friends online")}
          </p>
        </div>
      </div>
    </div>
  );
});

ContactList.displayName = "ContactList";
export default ContactList;
