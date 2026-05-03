import { useEffect, useRef, useState } from "react";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JitsiMeetingProps {
  roomId: string;
  displayName: string;
  onLeave?: () => void;
}

export function JitsiMeeting({ roomId, displayName, onLeave }: JitsiMeetingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load Jitsi external API script
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => {
      if (!containerRef.current) return;
      const domain = "meet.jit.si";
      const options = {
        roomName: `rize-mentor-${roomId}`,
        parentNode: containerRef.current,
        userInfo: { displayName },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableDeepLinking: true,
          prejoinPageEnabled: false,
          toolbarButtons: [
            "microphone", "camera", "desktop", "chat",
            "raisehand", "participants-pane", "tileview",
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          DEFAULT_BACKGROUND: "#0F172A",
          TOOLBAR_ALWAYS_VISIBLE: true,
          MOBILE_APP_PROMO: false,
        },
      };

      apiRef.current = new (window as any).JitsiMeetExternalAPI(domain, options);

      apiRef.current.addEventListener("videoConferenceJoined", () => {
        setLoading(false);
        setJoined(true);
      });

      apiRef.current.addEventListener("participantJoined", () => {
        setParticipantCount(prev => prev + 1);
      });
      apiRef.current.addEventListener("participantLeft", () => {
        setParticipantCount(prev => Math.max(0, prev - 1));
      });

      apiRef.current.addEventListener("audioMuteStatusChanged", (data: any) => {
        setAudioMuted(data.muted);
      });
      apiRef.current.addEventListener("videoMuteStatusChanged", (data: any) => {
        setVideoMuted(data.muted);
      });

      apiRef.current.addEventListener("readyToClose", () => {
        onLeave?.();
      });
    };

    document.body.appendChild(script);

    return () => {
      apiRef.current?.dispose();
      script.remove();
    };
  }, [roomId, displayName]);

  const toggleAudio = () => apiRef.current?.executeCommand("toggleAudio");
  const toggleVideo = () => apiRef.current?.executeCommand("toggleVideo");
  const hangup = () => {
    apiRef.current?.executeCommand("hangup");
    onLeave?.();
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-border bg-background">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">Connecting to meeting room...</p>
          <p className="mt-1 text-xs text-muted-foreground">Waiting for participants to join</p>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full" style={{ minHeight: 500 }} />

      {joined && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-card/90 backdrop-blur-md border border-border rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
            <Users className="h-3.5 w-3.5" />
            <span>{participantCount + 1}</span>
          </div>
          <Button
            size="icon"
            variant={audioMuted ? "destructive" : "secondary"}
            className="h-10 w-10 rounded-full"
            onClick={toggleAudio}
          >
            {audioMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant={videoMuted ? "destructive" : "secondary"}
            className="h-10 w-10 rounded-full"
            onClick={toggleVideo}
          >
            {videoMuted ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="h-10 w-10 rounded-full"
            onClick={hangup}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
