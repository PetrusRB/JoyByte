import Area from "./Area";
import ContactChat from "./Contact";
import MessageCard from "./Message";
import Section from "./Section";
import SectionHeader from "./Section/Header";
import WelcomeChat from "./Welcome";

export const Chat: {
  Message: typeof MessageCard;
  Section: typeof Section;
  Area: typeof Area;
  SectionHeader: typeof SectionHeader;
  Contact: typeof ContactChat;
  Welcome: typeof WelcomeChat;
} = {
  Message: MessageCard,
  Section: Section,
  Area: Area,
  SectionHeader: SectionHeader,
  Contact: ContactChat,
  Welcome: WelcomeChat,
};
