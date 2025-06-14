import LayoutClient from "./(client)/layout";
import "./global.css";
import { Inter } from "next/font/google";
import localFont from 'next/font/local'
 
const inter = Inter({ subsets: ["latin"] });

const Fulmini = localFont({
  src: '../../public/fonts/fulmini.ttf',
})
const Retroica = localFont({
  src: '../../public/fonts/Retroica.ttf',
});

export const metadata = {
  title: "JoyByte",
  description: "Social network",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} ${Fulmini.className} ${Retroica.className} bg-black`}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}