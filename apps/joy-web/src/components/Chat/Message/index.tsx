import { Message } from "@hexagano/backend";
type MessageProps = {
  message: Message;
};
const MessageCard = ({ message }: MessageProps) => {
  return (
    <>
      <div className={`flex ${message.sent ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            message.sent
              ? "text-white rounded-br-none"
              : "text-gray-800 rounded-bl-none"
          }`}
          style={{
            backgroundColor: message.sent ? "#c4410c" : "#fed7aa",
          }}
        >
          <p className="text-sm">{message.text}</p>
          <p
            className={`text-xs mt-1 ${message.sent ? "text-orange-200" : "text-gray-600"}`}
          >
            {message.time}
          </p>
        </div>
      </div>
    </>
  );
};
export default MessageCard;
