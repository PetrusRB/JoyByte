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
  { name: "Anna Vitoria", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face" },
  { name: "Marliza Albino", avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=40&h=40&fit=crop&crop=face" },
  { name: "Cleber Souza", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" },
  { name: "Waglison Tonelo", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face" },
  { name: "Celia Ferreira", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face" }
];

export default function HomeForm() {
  return (
    <div className="min-h-screen dark:bg-black bg-white dark:text-white text-gray-600">
      <div className="flex max-w-7xl mx-auto pt-16">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-80 fixed left-0 top-16 h-full overflow-y-auto">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-80 lg:mr-80 px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <CreatePost />
            <PostGrid data={items} status="success" />
          </div>
        </div>

        {/* Right Sidebar - Contacts */}
        <div className="hidden lg:block w-80 fixed right-0 top-16 h-full overflow-y-auto">
          <ContactsList contacts={contacts} />
        </div>
      </div>
    </div>
  );
}
