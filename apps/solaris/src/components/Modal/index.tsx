"use client";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useRouter } from "next/navigation";
export default function Modal({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleOpenChange = () => {
    router.back();
  };

  return (
    <Dialog defaultOpen={true} open={true} onOpenChange={handleOpenChange}>
      <DialogOverlay>
        <DialogContent className="overflow-y-hidden">
          <DialogTitle>{title}</DialogTitle>
          {children}
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
