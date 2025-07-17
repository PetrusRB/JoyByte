"use client";
import CreatePost from "@/components/CreatePost";
import Modal from "@/components/Modal";
import { withPrivate } from "@/hocs/withPrivate";

function CreatePostPage() {
  return (
    <Modal title="Compartilhe suas ideias Criativas aqui.">
      <CreatePost />
    </Modal>
  );
}
export default withPrivate(CreatePostPage);
