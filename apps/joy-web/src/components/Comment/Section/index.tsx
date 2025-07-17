"use client";
import { Component } from "react";
import { Comment as CommentSchema, Reply } from "@/schemas";
import { Comment } from "..";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { User } from "@/schemas";
import { DEFAULT_AVATAR } from "@/libs/utils";

type Props = {
  comments: CommentSchema[];
  setComments: React.Dispatch<React.SetStateAction<CommentSchema[]>>;
  user: User | null;
  contentComment: string;
  setContentComment: React.Dispatch<React.SetStateAction<string>>;
  handleAddComment: () => void;
};

export class CommentSection extends Component<Props> {
  addReply = (
    commentId: number,
    content: string,
    author: string = "Usuário Anônimo",
  ) => {
    const { setComments } = this.props;
    const newReply: Reply = {
      id: `${commentId}-${Date.now()}`,
      author,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      content,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
    };

    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, newReply] }
          : comment,
      ),
    );
  };
  override render() {
    return (
      <>
        <div className="p-4 dark:bg-zinc-950 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              this.props.handleAddComment();
            }}
            className="flex items-center space-x-3 mb-4"
          >
            <Image
              src={this.props.user?.picture || DEFAULT_AVATAR}
              alt="Seu avatar"
              width={32}
              height={32}
              className="rounded-full flex-shrink-0"
              loading="lazy"
              priority={false}
              placeholder="blur"
              blurDataURL={DEFAULT_AVATAR}
            />
            <Input
              value={this.props.contentComment}
              onChange={(e) => this.props.setContentComment(e.target.value)}
              placeholder="🎨 Deixe sua criatividade fluir..."
              className="flex-1"
              maxLength={500}
              required
            />
            <button
              type="submit"
              disabled={!this.props.contentComment.trim() || !this.props.user}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-950 disabled:cursor-not-allowed text-white rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Enviar
            </button>
          </form>

          {/* Lista de comentários */}
          {this.props.comments.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              {this.props.comments.map((comment, index) => (
                <Comment.Card
                  key={index}
                  author={comment.author}
                  comment={comment}
                  index={index}
                  onAddReply={this.addReply}
                />
              ))}
            </div>
          )}
        </div>
      </>
    );
  }
}
