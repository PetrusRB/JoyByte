import { Component } from "react";
import { Button } from "@/components/Button";
import { ChevronDown, ChevronUp, Heart, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/libs/utils";
import { Reply } from "@/schemas/post";

type CommentFormProps = {
  reply: Reply;
  commentId: number;
};

type CommentFormState = {
  isReplyExpanded: boolean;
};

export class ReplyForm extends Component<CommentFormProps, CommentFormState> {
  constructor(props: CommentFormProps) {
    super(props);
    this.state = {
      isReplyExpanded: false,
    };
  }
  override render() {
    const { isReplyExpanded } = this.state;
    const { reply } = this.props;
    const shouldTruncateReply = reply.content.length > 200;
    const displayReplyContent =
      shouldTruncateReply && !isReplyExpanded
        ? reply.content.substring(0, 200) + "..."
        : reply.content;
    return (
      <>
        <div className="flex space-x-3 p-4 bg-orange-50 dark:bg-zinc-900 shadow-lg rounded-lg border-l-4 border-primary/20">
          <Avatar className="h-8 w-8 ring-2 ring-background flex-shrink-0">
            <AvatarImage src={reply.avatar} alt={reply.author} />
            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              {reply.author.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 min-w-0">
                <h4 className="font-semibold text-sm text-foreground truncate">
                  {reply.author}
                </h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(reply.timestamp ?? "")}
                </span>
              </div>
              <Button className="h-8 w-8 p-0 opacity-60 hover:opacity-100 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-3">
              <p className="text-sm text-foreground/90 leading-relaxed break-words whitespace-pre-wrap">
                {displayReplyContent}
              </p>
              {shouldTruncateReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    this.setState({ isReplyExpanded: !isReplyExpanded })
                  }
                  className="h-auto p-0 mt-2 text-xs text-primary hover:text-primary/80"
                >
                  {isReplyExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Ver menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Ver mais
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Button
                className={`h-9 px-4 transition-all duration-200 ${
                  reply.isLiked
                    ? "text-red-500 bg-red-50 hover:bg-red-100"
                    : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
                }`}
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${reply.isLiked ? "fill-current" : ""}`}
                />
                <span className="font-medium">{reply.likes}</span>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
