"use client";
import dynamic from "next/dynamic"
import {auth} from "@/auth"
import { SessionProvider } from "next-auth/react"
import { appWithTranslation } from 'next-i18next'
import HomeForm from "@/components/Home";
import { useAuth } from "@/contexts/auth/AuthContext";

const EnhancedAuth = dynamic(() => import("@/components/Login"), {
  ssr: false,
});

const Index = async() => {
  const {isAuthenticated} = useAuth();
  const session = await auth();
 
  if (isAuthenticated){
    return <HomeForm/>;
  }
  return (
    <SessionProvider session={session}>
      <EnhancedAuth />
    </SessionProvider>
  );
}


export default appWithTranslation(Index);