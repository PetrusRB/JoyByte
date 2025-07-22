"use client";
import dynamic from "next/dynamic";

const Camera = dynamic(() => import("lucide-react").then((m) => m.Camera));
const User = dynamic(() => import("lucide-react").then((m) => m.User));
const Palette = dynamic(() => import("lucide-react").then((m) => m.Palette));
const Save = dynamic(() => import("lucide-react").then((m) => m.Save));
const ArrowLeft = dynamic(() =>
  import("lucide-react").then((m) => m.ArrowLeft),
);
const DoorOpen = dynamic(() => import("lucide-react").then((m) => m.DoorOpen));
const Mars = dynamic(() => import("lucide-react").then((m) => m.Mars));
const Venus = dynamic(() => import("lucide-react").then((m) => m.Venus));

import { useRouter } from "next/navigation";
import { useState, useCallback, memo } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
const DynamicPopup = dynamic(() => import("@/components/DynamicPopup"), {
  ssr: false,
});
import { Toggles } from "@/components/Toggles";

import { useAuth } from "@/contexts/auth/AuthContext";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { useTheme } from "next-themes";
import { DEFAULT_AVATAR, DEFAULT_BIO } from "@/libs/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/TextArea";
import Image from "next/image";
import { getPlaceholder } from "@/libs/blur";
import { Avatar } from "@/components/Avatar";
import { User as UserSchema } from "@hexagano/backend";

const RenderProviderGroups = ({ user }: { user: UserSchema | null }) => {
  if (!user) return null;
  return (
    <>
      <Avatar.Group id="providers" srcs={["/user.png", "/user.png"]} />
    </>
  );
};
const SettingsComp = memo(() => {
  const { user, signOut } = useAuth();
  const t = useTranslations("User");
  const ConfigTrans = useTranslations("Config");
  const router = useRouter();
  const [errors, setErrors] = useState<string[] | null>(null);
  const { theme } = useTheme();
  const [name, setName] = useState(user?.name);
  const [exitPop, setExitPop] = useState<boolean>(false);
  const [bio, setBio] = useState(user?.bio ?? DEFAULT_BIO);
  const [genre, setGenre] = useState(user?.genre ?? "prefernottosay");
  const [profileImage, setProfileImage] = useState(
    user?.picture ?? "/user.png",
  );

  const genres = [
    { key: "man", icon: <Mars />, label: "Man" },
    { key: "female", icon: <Venus />, label: "Female" },
    {
      key: "other",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      label: "Other",
    },
    {
      key: "prefernottosay",
      icon: <p>🙊</p>,
      label: "Prefer not to say",
    },
  ];
  const [isLoading, setIsLoading] = useState(false);
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setProfileImage(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  const handleQuit = useCallback(async () => {
    await signOut();
  }, []);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          bio,
          genre,
        }),
      });
      if (!res) {
        throw new Error("Falha ao atualizar perfil: Não obteve resposta");
      }
      if (!res.ok) {
        throw new Error(
          "Falha ao atualizar perfil: Obteve Resposta, mas não é das boas.",
        );
      }

      setIsLoading(false);
      toast.success(
        "Perfil atualizado com sucesso, recarregue a pagina para ver as alterações",
      );
    } catch (err: any) {
      const newErrors: string[] = [];
      // tenta extrair JSON de erro
      let errJson: any = null;
      try {
        errJson = await err.response.json();
      } catch {
        /* não era JSON */
      }

      // Erros de validação do Zod
      if (errJson?.details?.fieldErrors) {
        for (const [field, msgs] of Object.entries<string[]>(
          errJson.details.fieldErrors,
        )) {
          msgs.forEach((msg) => newErrors.push(`${field}: ${msg}`));
        }
      }

      // Mensagem geral
      if (errJson?.error) {
        newErrors.push(errJson.error);
      } else if (err.message) {
        newErrors.push(err.message);
      } else {
        newErrors.push("Erro inesperado ao tentar atualizar o perfil.");
      }

      setErrors(newErrors);
      toast.error(
        `Erro ao tentar atualizar o perfil: ${err.message ?? "Desconhecido"}`,
      );
      console.error("[Update Profile error]", errJson ?? err);
    } finally {
      setIsLoading(false);
    }
  }, [name, bio, genre]);

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-black dark:text-white text-orange-700">
      <header className="sticky top-0 z-30 bg-orange-50 dark:bg-zinc-950 ring-1 rounded-lg dark:ring-zinc-800 ring-orange-200/40 backdrop-blur">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-orange-100 dark:hover:bg-zinc-900"
          >
            <ArrowLeft className="w-5 h-5 text-orange-700 dark:text-orange-400" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {t("Settings")}
            </h1>
            <p className="text-sm text-orange-600/70 dark:text-orange-300/70">
              {ConfigTrans("Personalize your Experience")}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col xl:flex-row xl:flex-wrap gap-8 w-full">
          <div className="w-full xl:w-1/3">
            <Card className="w-full dark:bg-zinc-950 bg-white/80 border-none dark:text-white text-orange-700 ring-1 ring-orange-200 dark:ring-zinc-800 hover:ring-orange-700">
              <CardHeader className="text-center pb-2">
                <CardTitle>{ConfigTrans("Preview")}</CardTitle>
                <CardDescription>
                  {ConfigTrans("How people see you")}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="relative inline-block">
                  <Image
                    src={profileImage ?? DEFAULT_AVATAR}
                    className="rounded-full ring-1 ring-orange-500 dark:ring-white"
                    alt="Seu Avatar"
                    width={98}
                    height={98}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={`data:image/png;base64,${getPlaceholder(user?.picture || "/user.png")}`}
                  />
                  <label
                    htmlFor="profileUpload"
                    className="absolute -bottom-1 -right-1 cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </label>
                  <input
                    id="profileUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{name}</h3>
                  <p className="text-sm opacity-70">{bio}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full xl:flex-1 space-y-6">
            <Card className="dark:bg-zinc-950 bg-white/80 border-none dark:text-white text-orange-700 ring-1 ring-orange-200 dark:ring-zinc-800 hover:ring-orange-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />{" "}
                  {ConfigTrans("Basic Information")}
                </CardTitle>
                <CardDescription>
                  {ConfigTrans("Update your basic data")}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{ConfigTrans("Username")}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Um nome de exibição"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">{ConfigTrans("Biography")}</Label>
                  <Textarea
                    id="bio"
                    value={bio ?? ""}
                    maxLength={500}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Eu sou programador"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="genre">{ConfigTrans("Genre")}</Label>
                  <Select
                    onValueChange={(value) => setGenre(value)}
                    defaultValue={user?.genre || "prefer_not_to_say"}
                  >
                    <SelectTrigger
                      id="genre"
                      className="w-full min-w-[200px] max-w-[280px]"
                    >
                      <SelectValue placeholder={ConfigTrans("SelectGenre")} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectGroup>
                        <SelectLabel>{ConfigTrans("Genre")}</SelectLabel>
                        {genres.map((genre) => (
                          <SelectItem
                            key={genre.key}
                            value={genre.key}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <span className="flex-shrink-0 text-orange-500 dark:text-orange-400">
                                {genre.icon}
                              </span>
                              <span className="flex-1 text-left font-medium">
                                {ConfigTrans(genre.label)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="providers">
                    {ConfigTrans("Providers of your account")}
                  </Label>
                  <RenderProviderGroups user={user} />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-zinc-950 bg-white/80 border-none dark:text-white text-orange-700 ring-1 ring-orange-200 dark:ring-zinc-800 hover:ring-orange-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" /> {ConfigTrans("Appearance")}
                </CardTitle>
                <CardDescription>
                  {ConfigTrans("Choose visual theme")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg px-4 py-3">
                  <div>
                    <Label className="font-medium">
                      {ConfigTrans("Dark Theme")}
                    </Label>
                    <p className="text-sm">
                      {theme === "dark" ? "Ativado" : "Desativado"}
                    </p>
                  </div>
                  <Toggles.Theme />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-zinc-950 bg-white/80 border-none dark:text-white text-orange-700 ring-1 ring-orange-200 dark:ring-zinc-800 hover:ring-orange-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <DoorOpen className="w-5 h-5 text-red-600" />{" "}
                  {ConfigTrans("Danger")}
                </CardTitle>
                <CardDescription>Aqui terão botões perigosos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  color="red"
                  onClick={() => setExitPop(true)}
                  variant="secondary"
                >
                  Sair
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              {errors && <p className="text-red-500 text-sm">{errors}</p>}
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 px-6 py-2 rounded-full shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:scale-100"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>

          <DynamicPopup
            isOpen={exitPop}
            onClose={() => setExitPop(false)}
            size="sm"
          >
            <div className="text-center space-y-6 p-6">
              <div className="flex justify-center items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-1">
                  Quer mesmo <span className="text-red-500">Sair?</span>
                </h2>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  type="button"
                  color="red"
                  className="bg-zinc-950 dark:text-white text-orange-700 ring ring-transparent transition-all duration-200 hover:ring-orange-700 rounded-full border-none"
                  onClick={() => {
                    handleQuit();
                    setExitPop(false);
                  }}
                >
                  <DoorOpen /> Sair
                </Button>
              </div>
            </div>
          </DynamicPopup>
        </div>
      </main>
    </div>
  );
});

export default SettingsComp;
