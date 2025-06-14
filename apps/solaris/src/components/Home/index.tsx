import { Post } from "@/types";
import LeftSidebar from "../LeftSideBar";
import PostGrid from "../Posts"; // Nome real é PostGrid
import RightSidebar from "../RightSideBar";

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
    image: "https://i.imgur.com/7W4gB0Z.png",
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

export default function HomeForm() {
  return (
    <div className="flex justify-center bg-black min-h-screen">
      <div className="flex w-full max-w-7xl">
        <aside className="hidden md:block w-64">
          <LeftSidebar />
        </aside>

        <main className="flex-1 flex flex-col gap-6 px-4 md:px-8 lg:px-12 py-6">
          <PostGrid data={items} status="success" />
        </main>

        <aside className="hidden lg:block w-72">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
