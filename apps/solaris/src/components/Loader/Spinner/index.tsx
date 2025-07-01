import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type SpinnerProps = {
  text?: string;
};
const Spinner: React.FC<SpinnerProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center dark:bg-black bg-white min-h-screen">
      <div className="w-32 h-32 items-center justify-center">
        <DotLottieReact src="/lotties/cat-loading.lottie" loop autoplay />
      </div>
      <p className="text-gray-600 dark:text-white">{text}</p>
    </div>
  );
};
export { Spinner };
