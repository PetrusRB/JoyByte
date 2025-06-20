"use client";

import { Image, Video, Smile } from "lucide-react";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/TextArea";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useTranslations } from "use-intl";
import { useCallback, useRef, useState, useTransition } from "react";
import ky from "ky";

export default function CreatePost() {
  const { user } = useAuth();
  const t = useTranslations("Post");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmitPost = useCallback(() => {
    const trimmedContent = content.trim();
    const trimmedTitle = title.trim();

    if (trimmedTitle.length > 100) {
      setError("Título tem que ser menor que 100 caracteres");
      return;
    }
    if (trimmedContent.length < 5 || trimmedTitle.length < 3) {
      setError("Título e descrição devem ter pelo menos 3 caracteres.");
      return;
    }

    setError(null);
    setSuccess(false);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    startTransition(async () => {
      try {
        const res = await ky
          .post("/api/post/create", {
            json: {
              title: trimmedTitle,
              content: trimmedContent,
            },
            signal: controller.signal,
          })
          .json<{ data: any }>();

        console.log("Post criado:", res.data);
        setTitle("");
        setContent("");
        setSuccess(true);
      } catch (err: any) {
        if (controller.signal.aborted) return;

        // Parse sofisticado de erro
        let message = "Erro inesperado.";

        if (err?.status && err?.data?.error) {
          switch (err.status) {
            case 400:
              message = "Campos inválidos: verifique o título e a descrição.";
              if (err.data.details?.fieldErrors) {
                const fields = Object.keys(err.data.details.fieldErrors).join(
                  ", ",
                );
                message += ` Erros em: ${fields}`;
              }
              break;
            case 401:
              message = "Você precisa estar autenticado para postar.";
              break;
            case 409:
              message = "Já existe um post com esse título.";
              break;
            case 415:
              message = "Content-Type inválido. (application/json esperado)";
              break;
            default:
              message = err.data.error || message;
          }
        }

        console.error("[CreatePost error]", err);
        setError(message);
      }
    });
  }, [title, content]);

  return (
    <Card className="dark:bg-black bg-white dark:text-white border-0 shadow-lg rounded-2xl overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start space-x-4">
          <img
            src={user?.picture ?? "/user.png"}
            alt="Seu perfil"
            className="w-12 h-12 rounded-full border-2 border-blue-200"
            loading="lazy"
          />
          <div className="flex-1 space-y-3">
            {/* Título criativo */}
            <div className="relative">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="🧠 Dê um título criativo..."
                required
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-md ring-transparent focus:bg-zinc-800 placeholder:text-zinc-500"
                disabled={isPending}
              />
            </div>

            {/* Descrição inspiradora */}
            <Textarea
              placeholder="💬 Compartilhe algo inspirador..."
              className="bg-zinc-950 border border-zinc-800 rounded-2xl ring-transparent resize-none focus:bg-zinc-800 text-md transition-all duration-200"
              rows={3}
              value={content}
              required
              onChange={(e) => setContent(e.target.value)}
              disabled={isPending}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && (
              <p className="text-green-500 text-sm">Post criado com sucesso!</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 gap-2 sm:gap-0 border-t border-zinc-800">
          <div className="flex flex-wrap gap-2 pt-2">
            <PostAction
              icon={<Video className="w-4 h-4 mr-1" />}
              label={t("Go Live")}
            />
            <PostAction
              icon={<Image className="w-4 h-4 mr-1" />}
              label={t("Photo/Video")}
            />
            <PostAction
              icon={<Smile className="w-4 h-4 mr-1" />}
              label={t("Reaction")}
            />
          </div>

          <Button
            onClick={handleSubmitPost}
            disabled={
              isPending || title.trim().length < 3 || content.trim().length < 3
            }
            className="bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl px-6 py-2 transition-all duration-200 hover:scale-105 disabled:opacity-50"
          >
            {isPending ? "Postando..." : "Postar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const PostAction = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <Button
    variant="ghost"
    className="flex items-center rounded-xl px-3 py-1.5 hover:bg-zinc-800/30 hover:text-white text-sm transition"
  >
    {icon}
    {label}
  </Button>
);
