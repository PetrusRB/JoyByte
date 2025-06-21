"use client";

import { Camera, User, Palette, Save, ArrowLeft, DoorOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo, Suspense, memo } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { useAuth } from "@/contexts/auth/AuthContext";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import DynamicPopup from "@/components/DynamicPopup";
import ThemeSwitch from "@/components/Toggles/theme";
import { useTheme } from "next-themes";
import { Skeleton } from "antd";
import { DEFAULT_AVATAR, getInitials } from "@/libs/utils";

const Settings = memo(() => {
  const { user, signOut } = useAuth();
  const t = useTranslations("User");
  const ConfigTrans = useTranslations("Config");
  const AuthTrans = useTranslations("Auth");
  const router = useRouter();
  const { theme } = useTheme();
  const [name, setName] = useState(user?.name ?? "Desconhecido");
  const [exitPop, setExitPop] = useState<boolean>(false);
  const [email, setEmail] = useState(user?.email ?? "Email Desconhecido");
  const [profileImage, setProfileImage] = useState(
    user?.picture ?? "/user.png",
  );
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
    await new Promise((res) => setTimeout(res, 1000));
    toast.success("Configurações salvas!");
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-black dark:text-white text-orange-700">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-black ring-1 dark:ring-zinc-800 ring-orange-200/40 backdrop-blur">
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
              Personalize sua experiência
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col xl:flex-row xl:flex-wrap gap-8 w-full">
          <div className="w-full xl:w-1/3">
            <Card className="w-full transition-all dark:bg-zinc-950 bg-white/80 border-none dark:text-white text-orange-700 ring-1 ring-orange-200 dark:ring-zinc-800 hover:ring-orange-700">
              <CardHeader className="text-center pb-2">
                <CardTitle>{ConfigTrans("Preview")}</CardTitle>
                <CardDescription>
                  {ConfigTrans("How people see you")}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={profileImage ?? DEFAULT_AVATAR}
                      alt="Profile"
                      loading="lazy"
                    />
                    <AvatarFallback className="bg-orange-500 text-white text-xl">
                      {getInitials(user?.name ?? "Misterioso(a)")}
                    </AvatarFallback>
                  </Avatar>
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
                  <p className="text-sm opacity-70">{email}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full xl:flex-1 space-y-6">
            <Card className="dark:bg-zinc-950 bg-white/80 border-none dark:text-white text-orange-700 ring-1 ring-orange-200 dark:ring-zinc-800 hover:ring-orange-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />{" "}
                  {ConfigTrans("Pessoal Information")}
                </CardTitle>
                <CardDescription>Atualize seus dados básicos</CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{AuthTrans("Username")}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="border-orange-200 bg-zinc-100 dark:bg-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{AuthTrans("Email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jubiscleudon@email.com"
                    className="border-orange-200 bg-zinc-100 dark:bg-zinc-800"
                  />
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
                  <ThemeSwitch />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-zinc-950 bg-white/80 border-none dark:text-white text-orange-700 ring-1 ring-orange-200 dark:ring-zinc-800 hover:ring-orange-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DoorOpen className="w-5 h-5" /> {ConfigTrans("Danger")}
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

const PerfomantSettings = () => {
  return (
    <>
      <Suspense fallback={<Skeleton />}>
        <Settings />
      </Suspense>
    </>
  );
};

export default PerfomantSettings;
