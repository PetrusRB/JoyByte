import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Calendar, Link2, Mail, Edit3, Users } from "lucide-react";
import { UserProfile } from "@/schemas/user";
import { useTranslations } from "next-intl";

interface ProfileInfoProps {
  profile: UserProfile;
  postCount: number | undefined;
  isFollowing: boolean;
  isCurrentUser: boolean;
}

const Info = ({
  profile,
  postCount,
  isCurrentUser,
  isFollowing,
}: ProfileInfoProps) => {
  const router = useRouter();
  const formattedDate = new Date(profile?.created_at || "").toLocaleDateString(
    "pt-BR",
    {
      month: "long",
      year: "numeric",
    },
  );

  const t = useTranslations("User");

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
      {/* Informações do perfil */}
      <div className="flex-1 text-center lg:text-left">
        <h1 className="text-xl sm:text-2xl font-bold">
          {profile.name || "Misterioso(a)"}
        </h1>
        <p className="mb-4 dark:text-white text-orange-500">
          @{profile.normalized_name || "sem-nome"}
        </p>

        {profile.bio && <p className="mb-4 leading-relaxed">{profile.bio}</p>}

        {/* Detalhes */}
        <div className="flex flex-wrap gap-2 sm:gap-4 text-sm mb-4 justify-center lg:justify-start">
          {profile.social_media?.website && (
            <a
              href={profile.social_media.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-zinc-100 transition-colors"
            >
              <Link2 className="w-4 h-4" />
              <span className="truncate max-w-xs">
                {profile.social_media.website.replace(/^https?:\/\//, "")}
              </span>
            </a>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Entrou em {formattedDate}</span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex gap-4 sm:gap-8 justify-center lg:justify-start">
          <StatItem value={profile.following || 0} label="Seguindo" />
          <StatItem value={profile.followers || 0} label="Seguidores" />
          <StatItem value={postCount || 0} label="Posts" />
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2 justify-center lg:justify-end flex-shrink-0">
        {isCurrentUser ? (
          <Button
            onClick={() => router.push("/config")}
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            {t("EditProfile")}
          </Button>
        ) : (
          <>
            <Button className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{t(isFollowing ? "Unfollow" : "Follow")}</span>
            </Button>
            <Button variant="outline" size="icon">
              <Mail className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

const StatItem = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="font-semibold">{value}</span>
    <span className="text-xs sm:text-sm">{label}</span>
  </div>
);

export default Info;
