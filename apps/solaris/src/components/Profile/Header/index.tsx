import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ArrowLeft } from "lucide-react";
import DynamicMedia from "@/components/DynamicMedia";
import Image from "next/image";

interface ProfileHeaderProps {
  banner?: string;
  avatar?: string;
  name?: string;
}

const Header = ({ banner, avatar, name }: ProfileHeaderProps) => {
  const router = useRouter();

  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-48 sm:h-56 md:h-64 bg-orange-50 dark:bg-zinc-800 w-full relative">
        {banner && (
          <DynamicMedia
            url={banner}
            alt={`Banner de ${name}`}
            fill
            className="object-cover"
          />
        )}

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-zinc-700/50 hover:bg-zinc-600 rounded-full z-10"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Avatar */}
      <div className="absolute -bottom-12 sm:-bottom-16 left-1/2 transform -translate-x-1/2">
        <div className="relative h-24 w-24 sm:h-32 sm:w-32">
          <Image
            src={avatar || "/default-avatar.png"}
            alt={`Foto de ${name}`}
            className="rounded-full border-4 border-white shadow-lg"
            fill
            sizes="(max-width: 640px) 96px, 128px"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
