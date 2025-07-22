import { Button } from "@/components/Button";
import {
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  Smile,
  Video,
} from "lucide-react";
import { Chat } from "..";
import { Input } from "@/components/ui/Input";
import { Contact, Message } from "@hexagano/backend";
import { getAvatar } from "@/libs/avatar";

interface AreaProps {
  selectedContact: Contact;
  messages: Message[];
  newMessage: string;
  setNewMessage: (value: string) => void;
  handleSendMessage: () => void;
}

const Area = ({
  selectedContact,
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
}: AreaProps) => {
  return (
    <>
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-orange-100 to-orange-50 dark:from-zinc-800 dark:to-zinc-700 border-orange-200 dark:border-zinc-600">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={getAvatar(selectedContact.avatar) || "/placeholder.svg"}
              alt={selectedContact.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-orange-300 dark:border-zinc-500"
            />
            {/* Status indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-800"></div>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">
              {selectedContact.name}
            </h2>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              Online
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-zinc-600 transition-colors"
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-zinc-600 transition-colors"
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-zinc-600 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-orange-25 to-white dark:from-zinc-900 dark:to-zinc-800">
        {messages.map((message) => (
          <Chat.Message key={message.id} message={message} />
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white dark:bg-zinc-800 border-orange-200 dark:border-zinc-600">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <div className="flex-1 flex items-center gap-2 rounded-full px-4 py-2">
            <Input
              placeholder="Digite uma mensagem"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="border-0 focus:ring-0 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            size="sm"
            className="rounded-full w-10 h-10 p-0 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default Area;
