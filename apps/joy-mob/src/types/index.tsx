import { TextInputProps } from "react-native";

export type InputProps = Readonly<TextInputProps> & {
  icon: any;
  placeholder: string;
  secureIcon?: any;
  secureTextEntry?: boolean;
  toggleSecure?: () => void;
  keyboardType?: string;
};
