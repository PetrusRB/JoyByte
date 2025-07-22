"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Chat } from "..";
import { ArrowLeft } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
  unread?: number;
}

interface Message {
  id: string;
  text: string;
  time: string;
  sent: boolean;
}

export default function Section() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const contacts: Contact[] = [
    {
      id: "1",
      name: "Marizete",
      lastMessage: "O meu amor, muito obrigada por lembrar do...",
      time: "Ontem",
      avatar: "",
    },
    {
      id: "2",
      name: "+55 69 8114-5660 (você)",
      lastMessage: "📱📄 Joy.apk",
      time: "quarta-feira",
      avatar: "",
    },
    {
      id: "3",
      name: "Laços Unidos",
      lastMessage: "Legião Alfa - FF",
      time: "quarta-feira",
      avatar: "",
    },
    {
      id: "4",
      name: "Mari Albino A31",
      lastMessage: "📷 Foto",
      time: "quarta-feira",
      avatar: "",
    },
    {
      id: "5",
      name: "Marilza",
      lastMessage: "📷 Foto",
      time: "quarta-feira",
      avatar: "",
    },
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Oi! Como você está?",
      time: "14:30",
      sent: false,
    },
    {
      id: "2",
      text: "Estou bem, obrigado! E você?",
      time: "14:32",
      sent: true,
    },
    {
      id: "3",
      text: "Tudo ótimo por aqui também!",
      time: "14:33",
      sent: false,
    },
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedContact) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        time: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sent: true,
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setIsMobileMenuOpen(false); // Fecha o menu mobile ao selecionar contato
  };

  const handleBackToContacts = () => {
    setSelectedContact(null);
    setIsMobileMenuOpen(true);
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex h-screen dark:bg-zinc-950 bg-orange-50 relative">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        w-80 lg:flex flex-col dark:bg-zinc-900 bg-orange-100 dark:text-white text-orange-700
        ${selectedContact ? "hidden lg:flex" : "flex"}
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-full sm:w-80 lg:w-80
        transform ${isMobileMenuOpen || !selectedContact ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        transition-transform duration-300 ease-in-out lg:transition-none
      `}
      >
        {/* Header */}
        <Chat.SectionHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Filter Tabs */}
        <div
          className="flex p-2 gap-1 border-b overflow-x-auto"
          style={{ borderColor: "#fed7aa" }}
        >
          {["Tudo", "Não lidas", "Favoritas", "Grupos"].map((tab, index) => (
            <Button
              key={tab}
              variant="ghost"
              size="sm"
              className={`text-sm whitespace-nowrap flex-shrink-0 ${
                index === 0
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-gray-400 hover:text-white dark:hover:text-white"
              }`}
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <Chat.Contact
              key={contact.id}
              contact={contact}
              selectedContact={selectedContact}
              setSelectedContact={handleContactSelect}
            />
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={`
        flex-1 flex flex-col
        ${selectedContact ? "flex" : "hidden lg:flex"}
        w-full lg:w-auto
      `}
      >
        {selectedContact ? (
          <>
            {/* Mobile Back Button */}
            <div className="lg:hidden flex items-center p-2 bg-orange-100 dark:bg-zinc-800 border-b border-orange-200 dark:border-zinc-600">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToContacts}
                className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-zinc-700"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
            </div>

            <Chat.Area
              selectedContact={selectedContact}
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
            />
          </>
        ) : (
          /* Welcome Screen */
          <Chat.Welcome />
        )}
      </div>

      {/* Mobile Menu Toggle Button - Only show when contact is selected */}
      {selectedContact && (
        <Button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 w-10 h-10 p-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg"
        >
          <div className="w-4 h-4 flex flex-col justify-between">
            <div className="w-full h-0.5 bg-white"></div>
            <div className="w-full h-0.5 bg-white"></div>
            <div className="w-full h-0.5 bg-white"></div>
          </div>
        </Button>
      )}
    </div>
  );
}
