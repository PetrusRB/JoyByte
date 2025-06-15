"use client"
import { useState } from "react";
import { Camera, User, Palette, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useTranslations } from "next-intl";

const Settings = () => {
    const navigate = useRouter();
    const { toast } = useToast();
    const {user} = useAuth();
    const t = useTranslations("User")
    const [name, setName] = useState<string>(user?.user_metadata?.name??"Desconhecido");
    const [email, setEmail] = useState<string>(user?.user_metadata?.email??"Email Desconhecido");
    const [profileImage, setProfileImage] = useState(user?.user_metadata?.picture??"/user.png");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
            title: "Configurações salvas!",
            description: "Suas alterações foram salvas com sucesso.",
        });

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-orange-50 dark:bg-black">
            {/* Header */}
            <div className="dark:bg-black bg-white/80 border-b border-orange-200/60 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate.back()}
                            className="rounded-full hover:bg-orange-100"
                        >
                            <ArrowLeft className="w-5 h-5 text-orange-700" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                {t("Settings")}
                            </h1>

                            <p className="text-orange-600/70 text-sm">Personalize sua experiência</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Profile Preview */}
                    <div className="lg:col-span-1">
                        <Card className="border-orange-200 shadow-lg shadow-orange-100/50 bg-white/70 dark:bg-black text-orange-700 dark:text-white">
                            <CardHeader className="text-center pb-2">
                                <CardTitle>Preview</CardTitle>
                                <CardDescription>
                                    Como outros te veem
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center space-y-4">
                                <div className="relative inline-block">
                                    <Avatar className="w-24 h-24 border-4 border-orange-200">
                                        <AvatarImage src={profileImage} alt="Profile" />
                                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white text-xl">
                                            {name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                                        <Camera className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold">{name}</h3>
                                    <p className="text-sm">{email}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Settings Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Settings */}
                        <Card className="border-orange-200 shadow-lg shadow-orange-100/50  bg-white/70 text-orange-800 dark:bg-black dark:text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Informações Pessoais
                                </CardTitle>

                                <CardDescription className="">
                                    Atualize suas informações básicas
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="profileImage" className="font-medium">
                                        Foto de Perfil
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-16 h-16 border-2 border-orange-200">
                                            <AvatarImage src={profileImage} alt="Profile" />
                                            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">
                                                {name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <input
                                                id="profileImage"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => document.getElementById('profileImage')?.click()}
                                                className="border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                                            >
                                                <Camera className="w-4 h-4 mr-2" />
                                                Alterar Foto
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="font-medium">
                                            Nome Completo
                                        </Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="border-orange-200 bg-zinc-950 focus:border-orange-400 focus:ring-orange-400/20"
                                            placeholder="Seu nome completo"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-medium">
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="border-orange-200 bg-zinc-950 focus:border-orange-400 focus:ring-orange-400/20"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Theme Settings */}
                        <Card className="border-orange-200 shadow-lg shadow-orange-100/50 bg-white/70 dark:bg-black text-orange-700 dark:text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="w-5 h-5" />
                                    Aparência
                                </CardTitle>
                                <CardDescription className="">
                                    Personalize a aparência do aplicativo
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200">
                                    <div className="space-y-1">
                                        <Label className="font-medium">Tema Escuro</Label>
                                        <p className="text-sm">
                                            {isDarkMode ? 'Ativado' : 'Desativado'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={isDarkMode}
                                        onCheckedChange={setIsDarkMode}
                                        className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-zinc-950"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <Button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-2 rounded-full shadow-lg shadow-orange-200 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:scale-100"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
