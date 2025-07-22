import { getAvatar } from "@/libs/avatar";
import { Contact } from "@hexagano/backend";

type ContactProps = {
  contact: Contact;
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact) => void;
};

const ContactChat = ({
  contact,
  selectedContact,
  setSelectedContact,
}: ContactProps) => {
  const isSelected = selectedContact?.id === contact.id;

  return (
    <div
      key={contact.id}
      onClick={() => setSelectedContact(contact)}
      className={`p-4 cursor-pointer border-b transition-all duration-200 ${
        // Bordas
        "dark:border-zinc-700 border-orange-200"
      } ${
        // Estados de seleção e hover
        isSelected
          ? "bg-orange-50 dark:bg-zinc-800 border-l-4 border-l-orange-500 dark:border-l-orange-400"
          : "hover:bg-orange-25 dark:hover:bg-zinc-700/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={getAvatar(contact.avatar) || "/placeholder.svg"}
            alt={contact.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-orange-200 dark:border-zinc-600"
          />
          {/* Status indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-800"></div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3
              className={`font-semibold truncate ${
                isSelected
                  ? "text-orange-800 dark:text-orange-300"
                  : "text-gray-800 dark:text-gray-200"
              }`}
            >
              {contact.name}
            </h3>
            <span
              className={`text-xs ${
                isSelected
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {contact.time}
            </span>
          </div>
          <p
            className={`text-sm truncate ${
              isSelected
                ? "text-orange-700 dark:text-orange-300"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {contact.lastMessage}
          </p>
        </div>

        {/* Unread indicator */}
        {contact.unread && contact.unread > 0 && (
          <div className="bg-orange-500 dark:bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm">
            {contact.unread > 9 ? "9+" : contact.unread}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactChat;
