"use client";

import { Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/Button";
import { useTranslations } from "next-intl";
import { usernameSlugSchema } from "@/schemas/user";
import { memo, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";

interface Contact {
  name: string;
  avatar: string;
}

interface ContactsListProps {
  contacts: Contact[];
}

const ContactsList = memo(({ contacts }: ContactsListProps) => {
  const t = useTranslations("User");
  const toastShown = useRef(false);

  const goto = useCallback((contact: Contact) => {
    if (!contact) return;

    const parsedSlug = usernameSlugSchema.safeParse(contact.name);

    if (!parsedSlug.success) {
      if (!toastShown.current) {
        toast.error(`Nome de usuário inválido: ${contact.name}`);
        toastShown.current = true;
      }
      return;
    }

    // Aqui você pode fazer o push para a rota, se quiser
    // router.push(`/@${slug}`);
  }, []);

  const renderedContacts = useMemo(
    () =>
      contacts.map((contact) => (
        <div
          key={contact.name}
          onClick={() => goto(contact)}
          className="flex items-center space-x-3 p-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]"
        >
          <div className="relative">
            <img
              loading="lazy"
              src={contact.avatar}
              alt={contact.name}
              className="w-10 h-10 rounded-full border-2 border-slate-200"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium dark:text-white hover:text-yellow-600 text-gray-600 truncate">
              {contact.name}
            </p>
            <p className="text-sm text-green-600">Online</p>
          </div>
        </div>
      )),
    [contacts, goto]
  );

  return (
    <div className="p-4 h-full dark:text-white text-gray-600">
      <div className="dark:text-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{t("Contacts")}</h3>
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

        <div className="space-y-2">{renderedContacts}</div>

        <div className="mt-6 p-3 dark:bg-zinc-950 bg-orange-50 dark:text-white text-orange-700 rounded-xl">
          <p className="text-sm">
            <span className="font-semibold text-green-600">{contacts.length}</span> {t("friends online")}
          </p>
        </div>
      </div>
    </div>
  );
});

ContactsList.displayName = "ContactsList";
export default ContactsList;
