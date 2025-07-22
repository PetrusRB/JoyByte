import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Text } from "react-native";

const SocialButton = ({ provider }: { provider: "Google" | "Github" }) => {
  const iconMap: any = {
    Google: "logo-google",
    Github: "logo-github",
  };

  return (
    <TouchableOpacity className="flex-1 flex-row items-center justify-center border border-slate-600 py-3 rounded-xl">
      <Ionicons
        name={iconMap[provider]}
        size={20}
        color={provider === "Google" ? "#EA4335" : "#fff"}
      />
      <Text className="text-white ml-2">{provider}</Text>
    </TouchableOpacity>
  );
};

export default SocialButton;
