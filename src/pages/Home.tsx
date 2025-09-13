import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import UnifiedSessionModal from "@/components/UnifiedSessionModal";
import {
  QrCode,
  ArrowRight,
  Github,
  ExternalLink,
  Shield,
  Zap,
  Smartphone,
  Database,
} from "lucide-react";

interface HomeProps {
  onSessionCreated: (code: string) => void;
  onSessionJoined: (code: string) => void;
}

const Home = ({ onSessionCreated, onSessionJoined }: HomeProps) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black text-white mb-4 tracking-tight">
            WeavePaste
          </h1>
          <p className="text-xl text-white/80 font-semibold max-w-2xl mx-auto">
            Sync clipboard across devices instantly and securely
          </p>
        </div>

        {/* Unified Session Modal */}
        <div className="max-w-4xl mx-auto mb-16 transform transition-all duration-700 ease-out">
          <UnifiedSessionModal
            onSessionCreated={onSessionCreated}
            onSessionJoined={onSessionJoined}
          />
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:scale-105">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              QR Code Sharing
            </h3>
            <p className="text-white/70 text-sm font-medium">
              Share sessions instantly with QR codes for quick device pairing
            </p>
          </div>

          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:scale-105">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Real-time Sync
            </h3>
            <p className="text-white/70 text-sm font-medium">
              Instant clipboard synchronization across all connected devices
            </p>
          </div>

          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:scale-105">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Secure Sessions
            </h3>
            <p className="text-white/70 text-sm font-medium">
              6-hour auto-expiring secure sessions with encrypted data transfer
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                  1
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Create or Join
                </h3>
                <p className="text-white/70 text-sm">
                  Create a new session or join an existing one using a session
                  code or QR scanner
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                  2
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Connect Devices
                </h3>
                <p className="text-white/70 text-sm">
                  Share the session code or QR code with your other devices to
                  connect them
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                  3
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Start Syncing
                </h3>
                <p className="text-white/70 text-sm">
                  Copy and paste content seamlessly across all connected devices
                  in real-time
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Footer */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-white font-semibold mb-1">
                  Developed by{" "}
                  <span className="text-blue-400 font-bold">
                    Somrit Dasgupta
                  </span>
                </p>
                <p className="text-white/70 text-sm font-medium">
                  Open source clipboard sync solution
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open("https://github.com/somritdasgupta", "_blank")
                  }
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold"
                >
                  <Github className="w-4 h-4 mr-2" />
                  @somritdasgupta
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      "https://github.com/somritdasgupta/weavepaste",
                      "_blank"
                    )
                  }
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Repository
                </Button>
                <Link to="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
