import { Component } from "react";
import { Button } from "@/components/Button";
import { Textarea } from "@/components/ui/TextArea";
import { Send, User } from "lucide-react";

type CommentFormProps = {
  onSubmit: (content: string, author?: string) => void;
  placeholder?: string;
  buttonText?: string;
  isReply?: boolean;
};

type CommentFormState = {
  content: string;
  author: string;
};

export class CommentForm extends Component<CommentFormProps, CommentFormState> {
  constructor(props: CommentFormProps) {
    super(props);
    this.state = {
      content: "",
      author: "",
    };
  }
  handleSubmit = (e: React.FormEvent) => {
    const { content, author } = this.state;
    const { onSubmit, isReply } = this.props;
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim(), author.trim() || undefined);
      this.setState({ content: "" });
      if (!isReply) this.setState({ author: "" });
    }
  };
  override render() {
    const { handleSubmit } = this;
    const { author, content } = this.state;
    const { isReply, placeholder, buttonText } = this.props;
    return (
      <>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isReply && (
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <User className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Seu nome (opcional)"
                value={author}
                onChange={(e) => this.setState({ author: e.target.value })}
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
          )}

          <div className="space-y-3">
            <Textarea
              placeholder={placeholder}
              value={content}
              onChange={(e) => this.setState({ content: e.target.value })}
              className="min-h-[100px] resize-none border-2 transition-colors focus:border-primary/50"
              rows={3}
            />

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {content.length}/500 caracteres
              </span>

              <Button
                type="submit"
                disabled={!content.trim()}
                className="min-w-[100px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                <Send className="h-4 w-4 mr-2" />
                {buttonText}
              </Button>
            </div>
          </div>
        </form>
      </>
    );
  }
}
