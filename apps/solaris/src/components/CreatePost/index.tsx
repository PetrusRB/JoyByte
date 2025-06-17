import { Image, Video, Smile } from "lucide-react";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/TextArea";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useTranslations } from "use-intl";

const CreatePost = () => {
  const { user } = useAuth();
  const t = useTranslations("Post");
  return (
    <Card className="dark:bg-black bg-white dark:text-white border-0 shadow-lg rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <img
            src={user?.picture ?? "/user.png"}
            alt="Seu perfil"
            className="w-12 h-12 rounded-full border-2 border-blue-200"
          />
          <div className="flex-1">
            <Textarea
              placeholder="Você ja disse uma frase positiva para alguem hoje?"
              className="border-0 bg-zinc-950 rounded-2xl ring-transparent resize-none focus:bg-zinc-800 transition-all duration-200 text-lg"
              rows={3}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              className="rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <Video className="w-4 h-4 mr-2" />
              {t("Go Live")}
            </Button>
            <Button
              variant="ghost"
              className="rounded-xl hover:bg-green-50 hover:text-green-600 transition-all duration-200"
            >
              <Image className="w-4 h-4 mr-2" />
              {t("Photo/Video")}
            </Button>
            <Button
              variant="ghost"
              className="rounded-xl hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200"
            >
              <Smile className="w-4 h-4 mr-2" />
              {t("Reaction")}
            </Button>
          </div>

          <Button className="bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl px-6 transition-all duration-200 hover:scale-105">
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
