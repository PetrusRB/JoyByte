import { FC } from "react";
import Content from "./Content";
import Header from "./Header";
import Info from "./Info";
import Tabs from "./Tabs";

export const Profile: {
  Header: typeof Header;
  Tabs: typeof Tabs;
  Info: typeof Info;
  Content: FC<any>;
} = {
  Header: Header,
  Content: Content,
  Info: Info,
  Tabs: Tabs,
};
