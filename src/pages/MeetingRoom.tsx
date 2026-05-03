import { useParams, useNavigate } from "react-router-dom";
import { JitsiMeeting } from "@/components/JitsiMeeting";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function MeetingRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("Student");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) setDisplayName(user.user_metadata.full_name);
      else if (user?.email) setDisplayName(user.email.split("@")[0]);
    });
  }, []);

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg font-bold">Invalid meeting link</p>
          <Button onClick={() => navigate("/mentors")} className="mt-4">Back to Mentors</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/mentors")} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Mentors
        </Button>
        <JitsiMeeting
          roomId={roomId}
          displayName={displayName}
          onLeave={() => navigate("/mentors")}
        />
      </div>
    </div>
  );
}
