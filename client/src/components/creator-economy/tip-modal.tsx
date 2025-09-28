import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Coins, Zap, Heart, Star, Coffee } from "lucide-react";
import type { User } from "@shared/schema";

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: User;
  postId?: string;
  onSubmit?: (amount: string, message: string) => void;
  isSubmitting?: boolean;
}

const PRESET_AMOUNTS = [
  { value: "1", label: "1 0G", icon: Coffee, description: "Buy a coffee" },
  { value: "5", label: "5 0G", icon: Heart, description: "Show appreciation" },
  { value: "10", label: "10 0G", icon: Star, description: "Great content!" },
  { value: "25", label: "25 0G", icon: Zap, description: "Amazing work!" },
];

export function TipModal({ isOpen, onClose, recipient, postId, onSubmit, isSubmitting }: TipModalProps) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePresetClick = (presetAmount: string) => {
    setAmount(presetAmount);
    setSelectedPreset(presetAmount);
  };

  const handleCustomAmount = (value: string) => {
    setAmount(value);
    setSelectedPreset(null);
  };

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    onSubmit?.(amount, message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border-cyan-400/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center space-x-2">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span>Send Tip</span>
          </DialogTitle>
        </DialogHeader>

        {/* Recipient Info */}
        <Card className="p-4 bg-black/40 border-cyan-400/20">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 border-2 border-cyan-400/30">
              <AvatarImage src={recipient.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                {recipient.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-white">{recipient.displayName}</h3>
              <p className="text-sm text-cyan-300/80">@{recipient.username}</p>
              {recipient.reputationScore > 0 && (
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-yellow-400">{recipient.reputationScore} reputation</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Preset Amount Buttons */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-cyan-300">Quick amounts:</label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_AMOUNTS.map((preset) => {
              const Icon = preset.icon;
              return (
                <Button
                  key={preset.value}
                  variant="outline"
                  onClick={() => handlePresetClick(preset.value)}
                  className={`p-3 h-auto flex-col space-y-2 ${
                    selectedPreset === preset.value
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                      : "border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
                  }`}
                  data-testid={`button-preset-${preset.value}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{preset.label}</span>
                  <span className="text-xs opacity-80">{preset.description}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-cyan-300">Custom amount (0G tokens):</label>
          <div className="relative">
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter amount..."
              value={amount}
              onChange={(e) => handleCustomAmount(e.target.value)}
              className="bg-black/40 border-cyan-400/30 text-white placeholder-cyan-300/50 pl-8"
              data-testid="input-tip-amount"
            />
            <Coins className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
          </div>
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-cyan-300">Message (optional):</label>
          <Textarea
            placeholder="Say something nice..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
            className="bg-black/40 border-cyan-400/30 text-white placeholder-cyan-300/50 min-h-[80px]"
            data-testid="textarea-tip-message"
          />
          <p className="text-xs text-cyan-300/60 text-right">{message.length}/200</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
            data-testid="button-cancel-tip"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-semibold"
            data-testid="button-send-tip"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Coins className="w-4 h-4 mr-2" />
                Send {amount || "0"} 0G
              </>
            )}
          </Button>
        </div>

        {/* Note about 0G Chain */}
        <div className="bg-cyan-400/10 border border-cyan-400/20 rounded-lg p-3 mt-2">
          <p className="text-xs text-cyan-300/80 text-center">
            💡 Tips are sent via 0G Chain and recorded on-chain for full transparency
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}