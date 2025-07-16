"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MultiplayerDialog() {
  const [roomCode, setRoomCode] = useState("");
  const [showMatchModal, setShowMatchModal] = useState(false);
  const router = useRouter();

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      router.push(`/game/vs-player/${roomCode.trim()}`);
    }
  };

  const handleCreateRoom = () => {
    const randomCode = Math.random().toString(36).substring(2, 8);
    router.push(`/game/vs-player/${randomCode}`);
  };

  return (
    <Dialog open={showMatchModal} onOpenChange={setShowMatchModal}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full bg-transparent">
          Find Match
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Join or Create Room</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="border-input focus-visible:ring-ring"
          />
          <Button className="w-full" onClick={handleJoinRoom}>
            Join Room
          </Button>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleCreateRoom}
          >
            Create Random Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
