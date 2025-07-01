"use client";

import { Image as ImageIcon, Video, Smile } from "lucide-react";
import { Button } from "@/components/Button";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/TextArea";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useTranslations } from "use-intl";
import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getUserSlug } from "@/libs/utils";
import { toast } from "sonner";
import { getPlaceholder } from "@/libs/blur";

export default function CreatePost() {
  const { user } = useAuth();
  const t = useTranslations("Post");
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setErrors] = useState<string[] | null>(null);
  const [success, setSuccess] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmitPost = useCallback(() => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const validation: string[] = [];

    if (trimmedTitle.length > 100) {
      validation.push("Título deve ter no máximo 100 caracteres.");
    }
    if (trimmedTitle.length < 3) {
      validation.push("Título deve ter pelo menos 3 caracteres.");
    }
    if (trimmedContent.length < 5) {
      validation.push("Descrição deve ter pelo menos 5 caracteres.");
    }

    if (validation.length) {
      setErrors(validation);
      setSuccess(false);
      return;
    }

    setErrors([]);
    setSuccess(false);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    startTransition(async () => {
      try {
        const res = await fetch("/api/post/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: trimmedTitle,
            content: trimmedContent,
          }),
        });

        if (!res)
          throw new Error("Falha ao criar este Post: Não obteve resposta.");
        if (!res.ok)
          throw new Error(
            "Falha ao criar este Post: Resposta não bem sucedida.",
          );

        console.log("Post criado:", res);
        setTitle("");
        setContent("");
        setSuccess(true);
      } catch (err: any) {
        if (controller.signal.aborted) return;

        const newErrors: string[] = [];
        // tenta extrair JSON de erro
        let errJson: any = null;
        try {
          errJson = await err.response.json();
        } catch {
          /* não era JSON */
        }

        // Erros de validação do Zod
        if (errJson?.details?.fieldErrors) {
          for (const [field, msgs] of Object.entries<string[]>(
            errJson.details.fieldErrors,
          )) {
            msgs.forEach((msg) => newErrors.push(`${field}: ${msg}`));
          }
        }

        // Mensagem geral
        if (errJson?.error) {
          newErrors.push(errJson.error);
        } else if (err.message) {
          newErrors.push(err.message);
        } else {
          newErrors.push("Erro inesperado ao criar post.");
        }

        setErrors(newErrors);
        toast.error(`Erro ao criar o post: ${err.message ?? "Desconhecido"}`);
        console.error("[CreatePost error]", errJson ?? err);
      }
    });
  }, [title, content]);

  return (
    <Card className="dark:bg-black bg-white dark:text-white border-0 shadow-lg rounded-2xl overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start space-x-4">
          <Image
            src={user?.picture || "/user.png"}
            alt="Seu perfil"
            onClick={() =>
              router.push(getUserSlug(user?.normalized_name || ""))
            }
            className="w-12 h-12 rounded-full cursor-pointer border-2 border-blue-200"
            loading="lazy"
            width={48}
            height={48}
            placeholder="blur"
            blurDataURL={`data:image/png;base64,${getPlaceholder(user?.picture || "/user.png")}`}
          />
          <div className="flex-1 space-y-3">
            {/* Título criativo */}
            <div className="relative">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="🧠 Dê um título criativo..."
                required
                disabled={isPending}
              />
            </div>

            {/* Descrição inspiradora */}
            <Textarea
              placeholder="💬 Compartilhe algo inspirador..."
              rows={3}
              value={content}
              required
              maxLength={1000}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPending}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && (
              <p className="text-green-500 text-sm">Post criado com sucesso!</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 gap-2 sm:gap-0 border-t border-orange-300 dark:border-zinc-800">
          <div className="flex flex-wrap gap-2 pt-2">
            <PostAction
              icon={<Video className="w-4 h-4 mr-1" />}
              label={t("Go Live")}
            />
            <PostAction
              icon={<ImageIcon className="w-4 h-4 mr-1" />}
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
            className="bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl px-6 py-2 transition duration-200 hover:scale-105 disabled:opacity-50"
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
    className="flex items-center rounded-xl px-3 py-1.5 dark:hover:bg-zinc-800/30 hover:bg-orange-200 hover:text-orange-700 dark:hover:text-white text-sm transition"
  >
    {icon}
    {label}
  </Button>
);
