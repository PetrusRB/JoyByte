import { Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/Button";

interface Contact {
  name: string;
  avatar: string;
}

interface ContactsListProps {
  contacts: Contact[];
}

const ContactsList = ({ contacts }: ContactsListProps) => {
  return (
    <div className="p-4 h-full dark:bg-black bg-white dark:text-white text-gray-600">
      <div className="dark:bg-black bg-white dark:text-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold dark:text-white text-gray-600">Contacts</h3>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 hover:bg-slate-100">
              <Search className="w-4 h-4 text-slate-500" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 hover:bg-slate-100">
              <MoreHorizontal className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="relative">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-10 h-10 rounded-full border-2 border-slate-200"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium dark:text-white hover:text-yellow-600 text-gray-600 truncate">{contact.name}</p>
                <p className="text-sm text-green-600">Online</p>
              </div>
            </div>
          ))}
        </div>

        {/* Online Status Summary */}
        <div className="mt-6 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-green-600">{contacts.length}</span> friends online
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactsList;