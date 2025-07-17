"use client";
import { Component } from "react";
import { Comment as CommentSchema, CustomUserMetadata } from "@/schemas";
import {
  Heart,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { Reply as ReplyIcon } from "lucide-react";
import { DEFAULT_AVATAR, DEFAULT_NAME, formatRelativeTime } from "@/libs/utils";
import { Button } from "@/components/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Comment } from "..";

type Props = {
  index: number;
  comment: CommentSchema;
  author: CustomUserMetadata;
  onAddReply: (commentId: number, content: string, author?: string) => void;
};

type State = {
  showReplyForm: boolean;
  showReplies: boolean;
  isExpanded: boolean;
};

export class CommentCard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showReplyForm: false,
      showReplies: false,
      isExpanded: false,
    };
  }

  handleToggleReplyForm = () => {
    this.setState((prevState) => ({
      showReplyForm: !prevState.showReplyForm,
    }));
  };

  handleToggleReplies = () => {
    this.setState((prevState) => ({
      showReplies: !prevState.showReplies,
    }));
  };

  handleToggleExpanded = () => {
    this.setState((prevState) => ({
      isExpanded: !prevState.isExpanded,
    }));
  };

  handleReplySubmit = (content: string, author?: string) => {
    this.props.onAddReply(this.props.comment.id, content, author);
    this.setState({ showReplyForm: false });
  };

  override render() {
    const { comment } = this.props;
    const { showReplyForm, showReplies, isExpanded } = this.state;

    // Tratamento seguro para valores nulos/undefined
    const authorName = comment.author?.name || DEFAULT_NAME || "Anônimo";
    const authorPicture = comment.author?.picture || DEFAULT_AVATAR;
    const commentContent = comment.content || "";
    const commentTimestamp = comment.timestamp || "";
    const commentLikes = comment.likes || 0;
    const commentReplies = comment.replies || [];
    const isLiked = comment.isLiked || false;

    const shouldTruncate = commentContent.length > 300;
    const displayContent =
      shouldTruncate && !isExpanded
        ? commentContent.substring(0, 300) + "..."
        : commentContent;

    return (
      <div className="bg-orange-50 dark:bg-zinc-950 dark:text-white text-orange-400 rounded-xl transition-all duration-300 overflow-hidden">
        <div className="p-6">
          <div className="flex space-x-4">
            <Avatar className="h-12 w-12 ring-2 ring-background shadow-lg flex-shrink-0">
              <AvatarImage src={authorPicture} alt={authorName} />
              <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                {authorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {authorName}
                  </h3>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(commentTimestamp)}
                  </span>
                </div>
                <Button className="h-8 w-8 p-0 opacity-60 hover:opacity-100 flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-4">
                <p className="text-orange-500 leading-relaxed break-words whitespace-pre-wrap">
                  {displayContent}
                </p>
                {shouldTruncate && (
                  <Button
                    onClick={this.handleToggleExpanded}
                    className="h-auto p-0 px-1 py-1 mt-2 text-sm"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Ver menos
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Ver mais
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-1 sm:space-x-4 flex-wrap gap-2">
                <Button
                  className={`h-9 px-4 transition-all duration-200 ${
                    isLiked
                      ? "text-red-500 bg-red-50 hover:bg-red-100"
                      : "hover:text-red-500 hover:bg-red-50"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`}
                  />
                  <span className="font-medium">{commentLikes}</span>
                </Button>

                <Button
                  onClick={this.handleToggleReplyForm}
                  className="h-9 px-4 hover:bg-primary/10 transition-colors"
                >
                  <ReplyIcon className="h-4 w-4 mr-2" />
                  Responder
                </Button>

                {commentReplies.length > 0 && (
                  <Button
                    onClick={this.handleToggleReplies}
                    className="h-9 px-4 hover:bg-primary/10 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {showReplies ? "Ocultar" : "Ver"} {commentReplies.length}{" "}
                    resposta{commentReplies.length !== 1 ? "s" : ""}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {showReplyForm && (
            <div className="mt-6 ml-16 pl-4 border-l-2 border-primary/20">
              <Comment.Form
                onSubmit={this.handleReplySubmit}
                placeholder="Escreva sua resposta..."
                buttonText="Responder"
                isReply={true}
              />
            </div>
          )}
        </div>

        {showReplies && commentReplies.length > 0 && (
          <div className="bg-muted/20 p-6 pt-0">
            <div className="ml-16 space-y-4">
              {commentReplies.map((reply) => (
                <Comment.Reply
                  key={reply?.id || Math.random()}
                  reply={reply}
                  commentId={comment.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}
