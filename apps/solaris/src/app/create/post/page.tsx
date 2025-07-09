"use client";
import CreatePost from "@/components/CreatePost";
import { withPrivate } from "@/hocs/withPrivate";

function CreatePostPage() {
  return (
    <div>
      <CreatePost />
    </div>
  );
}
export default withPrivate(CreatePostPage);
