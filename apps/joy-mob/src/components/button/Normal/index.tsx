import { Text, TouchableOpacity } from "react-native";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/libs/utils";
import { Colors } from "@/constants/Colors";

type Props = {
  text: string;
  onClick: () => void;
  className?: string;
  variant?: keyof typeof buttonVariants;
};

// Define as variantes com class-variance-authority (CVA)
export const buttonVariants = {
  default: `bg-[${Colors.button.default}] rounded-xl py-3 mt-4`,
  danger: `bg-[${Colors.button.danger}] rounded-3xl py-3 mt-4`,
  success: `bg-[${Colors.button.success}] rounded-3xl py-3 mt-4`,
};

const NormalButton = ({
  text,
  onClick,
  className,
  variant = "default",
}: Props) => {
  return (
    <TouchableOpacity
      className={cn(buttonVariants[variant], className)}
      onPress={onClick}
    >
      <Text className="text-white text-center font-semibold">{text}</Text>
    </TouchableOpacity>
  );
};

export default NormalButton;
