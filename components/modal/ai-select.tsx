import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AIDifficultyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  const handleSelect = (level: string) => {
    onClose();
    router.push(`/game/vs-bot?level=${level}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Select AI Difficulty</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button onClick={() => handleSelect("easy")}>Easy</Button>
          <Button onClick={() => handleSelect("medium")} variant="secondary">
            Medium
          </Button>
          <Button onClick={() => handleSelect("hard")} variant="destructive">
            Hard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
