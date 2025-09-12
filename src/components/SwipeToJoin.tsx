import React, { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { ArrowRight, Users, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SwipeToJoinProps {
  sessionCode: string;
  onJoin: () => void;
  deviceCount: number;
  sessionTitle?: string;
}

export const SwipeToJoin: React.FC<SwipeToJoinProps> = ({
  sessionCode,
  onJoin,
  deviceCount,
  sessionTitle = "Weavepaste Session",
}) => {
  const [isSwipeComplete, setIsSwipeComplete] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 150], [0.7, 1]);
  const scale = useTransform(x, [0, 150], [0.95, 1.05]);
  const progress = useTransform(x, [0, 200], [0, 100]);
  const progressScale = useTransform(progress, [0, 100], [0, 1]);
  const instructionOpacity = useTransform(x, [0, 100], [1, 0]);
  const releaseOpacity = useTransform(x, [100, 200], [0, 1]);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x > 150) {
      setIsSwipeComplete(true);
      // Animate to completion
      x.set(200);
      setTimeout(() => {
        setIsVisible(false);
        onJoin();
      }, 500);
    } else {
      // Snap back
      x.set(0);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-x-4 bottom-6 z-50 lg:hidden"
    >
      <Card className="glass-card glass-hover backdrop-blur-xl bg-card/80 border border-white/10 shadow-2xl rounded-2xl p-6 overflow-hidden">
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-4 w-16 h-16 bg-accent/10 rounded-full blur-xl animate-float" />
          <div
            className="absolute bottom-4 right-4 w-20 h-20 bg-accent/5 rounded-full blur-2xl animate-float"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="relative space-y-4">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-accent animate-pulse" />
              <h3 className="text-lg font-bold bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
                Join Session
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">{sessionTitle}</p>
            <div className="flex items-center justify-center gap-3">
              <Badge
                variant="outline"
                className="font-mono bg-glass/50 backdrop-blur-sm"
              >
                {sessionCode}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{deviceCount} active</span>
              </div>
            </div>
          </div>

          {/* Swipe Area */}
          <div
            ref={constraintsRef}
            className="relative h-16 bg-background/30 rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Progress background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-accent/20 via-accent/30 to-accent/40 rounded-2xl origin-left"
              style={{
                scaleX: progressScale,
              }}
            />

            {/* Swipe instructions */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                className="text-sm font-medium text-muted-foreground"
                style={{ opacity: instructionOpacity }}
              >
                Swipe right to join →
              </motion.span>
              <motion.span
                className="text-sm font-medium text-accent"
                style={{ opacity: releaseOpacity }}
              >
                Release to join!
              </motion.span>
            </div>

            {/* Swipe handle */}
            <motion.div
              drag="x"
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              style={{ x, opacity, scale }}
              onDragEnd={handleDragEnd}
              className="absolute left-2 top-2 w-12 h-12 bg-gradient-to-r from-accent to-accent/80 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
              whileTap={{ scale: 1.1 }}
            >
              <motion.div
                animate={isSwipeComplete ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ArrowRight className="w-5 h-5 text-accent-foreground" />
              </motion.div>
            </motion.div>
          </div>

          {/* Additional info */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground/70">
              🚀 Real-time collaboration awaits
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
