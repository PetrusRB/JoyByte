"use client";

import {
  Camera, User, Palette, Save, ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { useAuth } from "@/contexts/auth/AuthContext";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const Settings = () => {
  const { user } = useAuth();
  const t = useTranslations("User");
  const router = useRouter();

  const [name, setName] = useState(user?.user_metadata?.name ?? "Desconhecido");
  const [email, setEmail] = useState(user?.user_metadata?.email ?? "Email Desconhecido");
  const [profileImage, setProfileImage] = useState(user?.user_metadata?.picture ?? "/user.png");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initials = useMemo(() =>
    name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(), [name]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => setProfileImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 1000));
    toast.success("Configurações salvas!");
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-black dark:text-white text-orange-700">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-black border-b border-orange-200/40 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-orange-100"
          >
            <ArrowLeft className="w-5 h-5 text-orange-700" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {t("Settings")}
            </h1>
            <p className="text-sm text-orange-600/70">Personalize sua experiência</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Preview */}
          <Card className="w-full lg:max-w-sm transition-all dark:bg-zinc-950 bg-white/80 border-none dark:text-white text-orange-700 ring ring-transparent hover:ring-orange-700">
            <CardHeader className="text-center pb-2">
              <CardTitle>Preview</CardTitle>
              <CardDescription>Como outros te veem</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileImage} alt="Profile" loading="lazy" />
                  <AvatarFallback className="bg-orange-500 text-white text-xl">{initials}</AvatarFallback>
                </Avatar>
                <label htmlFor="profileUpload" className="absolute -bottom-1 -right-1 cursor-pointer">
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
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm">{email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="flex-1 space-y-6">
            {/* Personal Info */}
            <Card className="dark:bg-zinc-950 transition-all bg-white/80 border-none dark:text-white text-orange-700 ring ring-transparent hover:ring-orange-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" /> Informações Pessoais
                </CardTitle>
                <CardDescription>Atualize seus dados básicos</CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="border-orange-200 bg-zinc-100 dark:bg-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="border-orange-200 bg-zinc-100 dark:bg-zinc-800"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Theme */}
            <Card className="dark:bg-zinc-950 transition-all border-none bg-white/80 dark:text-white text-orange-700 transition-all ring ring-transparent hover:ring-orange-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" /> Aparência
                </CardTitle>
                <CardDescription>Escolha o tema visual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg px-4 py-3">
                  <div>
                    <Label className="font-medium">Tema Escuro</Label>
                    <p className="text-sm">{isDarkMode ? "Ativado" : "Desativado"}</p>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                    className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-zinc-700"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save */}
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
        </div>
      </main>
    </div>
  );
};

export default Settings;
