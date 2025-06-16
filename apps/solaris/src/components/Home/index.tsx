"use client"
import { Post } from "@/types";
import Sidebar from "../Sidebar";
import CreatePost from "../CreatePost";
import PostGrid from "../Posts";
import ContactsList from "../ContactList";

const items: Post[] = [
  {
    id: "1",
    author: { id: "3", name: "Yakuza", avatar: "https://fastly.picsum.photos/id/496/536/354.jpg?hmac=U8UJd7a1T_tp4baF1lfEma_vCZI9XA6ou60WNjRWC4s", isOnline: true },
    title: "Meu primeiro post",
    content: "Este é o conteúdo do meu primeiro post no Solaris!",
    image: "https://i.imgur.com/7W4gB0Z.png",
    likes: 120,
    comments: [
      {
        id: "1",
        author: { id: "2", name: "Goku", avatar: "https://fastly.picsum.photos/id/496/536/354.jpg?hmac=U8UJd7a1T_tp4baF1lfEma_vCZI9XA6ou60WNjRWC4s", isOnline: true },
        content: "Parabéns pelo primeiro post!",
        createdAt: Date.now().toString(),
      },
    ],
    createdAt: new Date(Date.now()),
    isLiked: true,
  },
  {
    id: "2",
    author: { id: "41", name: "Yakuza", avatar: "https://fastly.picsum.photos/id/496/536/354.jpg?hmac=U8UJd7a1T_tp4baF1lfEma_vCZI9XA6ou60WNjRWC4s", isOnline: true },
    title: "Capa de 360",
    content: "Capa de 360 no ff",
    image: "https://imbsfvotjqhpbvjkhbwi.supabase.co/storage/v1/object/sign/postmedia/videoplayback.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGRkZmRmNy03NmIxLTQ0ZTQtYjI4ZS0yYjk1ZDEwOWQ5YmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0bWVkaWEvdmlkZW9wbGF5YmFjay5tcDQiLCJpYXQiOjE3NDk5MTc2NjEsImV4cCI6MTc4MTQ1MzY2MX0.dBaEOGs-hvTk9PVCyvriG5gnOpGVJuggZU4LWR42xIY",
    likes: 120,
    comments: [
      {
        id: "2",
        author: { id: "2", name: "Pietro", avatar: "https://fastly.picsum.photos/id/496/536/354.jpg?hmac=U8UJd7a1T_tp4baF1lfEma_vCZI9XA6ou60WNjRWC4s", isOnline: true },
        content: "Olha o capa de 360",
        createdAt: Date.now().toString(),
      },
    ],
    createdAt: new Date(Date.now()),
    isLiked: true,
  },
];
const contacts = [
  { name: "Ezekiel Pinheiro", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" },
  { name: "Mari Albino", avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c5c8?w=40&h=40&fit=crop&crop=face" },
  { name: "Eduarda Oliveira", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" },
  { name: "Xbvv Zx", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=404&auto=format&fit=crop=face" },
  { name: "Anna Vitoria", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=404&auto=format&fit=crop=face" },
  { name: "Marliza Albino", avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=40&h=40&fit=crop&crop=face" },
  { name: "Cleber Souza", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" },
  { name: "Waglison Tonelo", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face" },
  { name: "Celia Ferreira", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face" }
];

export default function HomeForm() {
  return (
      <div className="min-h-screen dark:bg-black bg-orange-50 dark:text-white text-orange-700">
           <div className="grid grid-cols-1 lg:grid-cols-[250px,1fr,250px] gap-4 max-w-7xl mx-auto pt-4 lg:pt-16">
             {/* Left Sidebar */}
             <aside className="hidden lg:block">
               <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                 <Sidebar />
               </div>
             </aside>

             {/* Main Content */}
             <main className="col-span-1 lg:col-span-1 px-2 sm:px-4 py-4">
               <div className="max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto space-y-4 sm:space-y-6">
                 <CreatePost />
                 <PostGrid data={items} status="success" />
               </div>
             </main>

             {/* Right Sidebar - Contacts */}
             <aside className="hidden lg:block">
               <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                 <ContactsList contacts={contacts} />
               </div>
             </aside>
           </div>
      </div>
  );
}
