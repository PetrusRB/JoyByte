"use client";
import dynamic from "next/dynamic";
import { appWithTranslation } from 'next-i18next';

const EnhancedAuth = dynamic(() => import("@/components/Login"), {
  ssr: false,
});

const Index = () => {
  return (
    <EnhancedAuth />
  );
}


export default appWithTranslation(Index);