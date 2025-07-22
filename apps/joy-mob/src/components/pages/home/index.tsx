"use client";

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { cn } from "@/libs/utils";
import { InputProps } from "@/types";
import InputField from "@/components/input";
import { Button } from "@/components/button";

export default function Home() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [authType, setAuthType] = useState<"login" | "register">("register");

  const [email, setEmail] = useState("");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePassword = () => setPasswordVisible((prev) => !prev);

  const isLoginIn = authType === "login";

  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    Google: "logo-google",
    Github: "logo-github",
    Facebook: "logo-facebook",
  };

  return (
    <View className="flex-1 flex-row bg-black">
      {/* Formulário */}
      <View className="w-full md:w-1/2 p-6 justify-center bg-[#000]">
        <Text className="text-white text-2xl font-bold mb-1">
          {isLoginIn ? "Bem vindo de volta!" : "Bem vindo!"}
        </Text>
        <Text className="text-slate-400 mb-6">
          {isLoginIn ? "Faça login" : "Cadastre-se"} na sua conta para continuar
        </Text>

        <View className="flex-row gap-4 mb-4">
          <Button.Social provider="Google" />
          <Button.Social provider="Github" />
        </View>

        <Text className="text-slate-400 text-center my-2">
          Ou continue usando um E-mail.
        </Text>
        {!isLoginIn && (
          <InputField
            icon="person"
            placeholder="Um nome criativo aqui."
            keyboardType="default"
          />
        )}
        <InputField
          icon="mail"
          placeholder="seu@email.com"
          keyboardType="email-address"
        />
        <InputField
          icon="lock-closed"
          placeholder="Digite sua senha"
          secureTextEntry={!passwordVisible}
          toggleSecure={togglePassword}
          secureIcon={passwordVisible ? "eye-off" : "eye"}
        />

        <TouchableOpacity className="bg-orange-600 rounded-xl py-3 mt-4">
          <Text className="text-white text-center font-semibold">
            {isLoginIn ? "Entrar" : "Cadastrar"} na plataforma
          </Text>
        </TouchableOpacity>

        {isLoginIn && (
          <Text className="text-orange-500 text-center mt-4">
            Esqueceu sua senha?
          </Text>
        )}
        <Text className="text-slate-400 text-center mt-4">
          {isLoginIn ? "Ainda não tem uma conta?" : "Já tem uma conta?"}
          <Text
            className="text-orange-500"
            onPress={() => setAuthType(isLoginIn ? "register" : "login")}
          >
            {isLoginIn ? "Cadastre-se" : "Fazer login"}
          </Text>
        </Text>
      </View>

      {/* Banner lado direito só em telas maiores */}
      <View className="hidden md:flex w-1/2 bg-gradient-to-br from-black to-orange-900 justify-center items-center px-8">
        <Text className="text-white text-3xl font-bold text-center">
          Transforme suas{" "}
          <Text className="text-orange-500">ideias em realidade</Text>
        </Text>
        <Text className="text-slate-300 text-center mt-4">
          Junte-se a milhares de pessoas que já descobriram o poder de nossa
          plataforma. Sua jornada de sucesso começa aqui.
        </Text>
        <Text className="text-orange-400 mt-6">
          • Mais de 50.000 usuários ativos
        </Text>
      </View>
    </View>
  );
}
