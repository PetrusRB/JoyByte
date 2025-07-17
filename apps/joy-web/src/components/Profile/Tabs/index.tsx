import { Grid3X3, Camera, Heart } from "lucide-react";

interface ProfileTabsProps {
  activeTab: "posts" | "media" | "likes";
  onChangeTab: (tab: "posts" | "media" | "likes") => void;
}

const Tabs = ({ activeTab, onChangeTab }: ProfileTabsProps) => {
  const tabs = [
    { id: "posts", icon: Grid3X3, label: "Posts" },
    { id: "media", icon: Camera, label: "Mídia" },
    { id: "likes", icon: Heart, label: "Curtidas" },
  ] as const;

  return (
    <div className="border-b border-orange-300 dark:border-zinc-700 mt-8">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex gap-2 sm:gap-6 justify-center overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`py-3 px-3 sm:px-4 text-sm sm:text-base hover:text-orange-800 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-orange-700 border-b-2 border-orange-300 dark:border-zinc-500"
                  : ""
              }`}
            >
              <tab.icon className="w-4 h-4 inline-block mr-1" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tabs;
