import { useState } from "react";
import { X, Calendar, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Mentor {
  id: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  avatar_color: string;
}

interface BookingModalProps {
  mentor: Mentor;
  onClose: () => void;
  onBooked: () => void;
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

const durations = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
];

export function BookingModal({ mentor, onClose, onBooked }: BookingModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"select" | "confirm" | "done">("select");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Generate next 7 dates
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      value: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" }),
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      date: d.getDate(),
    };
  });

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be logged in to book a session.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`);
    const jitsiRoomId = `rize-${mentor.id.slice(0, 8)}-${Date.now()}`;

    const { error } = await supabase.from("bookings").insert({
      mentor_id: mentor.id,
      student_id: user.id,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: duration,
      jitsi_room_id: jitsiRoomId,
      notes,
      status: "confirmed",
    });

    setLoading(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
      return;
    }

    setStep("done");
    onBooked();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-float-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground", mentor.avatar_color)}>
              {mentor.initials}
            </div>
            <div>
              <p className="font-display font-bold text-sm">{mentor.name}</p>
              <p className="text-xs text-muted-foreground">{mentor.role} at {mentor.company}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "done" ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-accent/15 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-display font-bold text-lg">Session Booked!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your {duration}-min session with {mentor.name} is confirmed for{" "}
              {new Date(`${selectedDate}T${selectedTime}`).toLocaleDateString("en-IN", {
                weekday: "long", month: "long", day: "numeric",
              })} at {selectedTime}.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">You'll find the video call link in your bookings.</p>
            <Button onClick={onClose} className="mt-6 w-full rounded-xl">Done</Button>
          </div>
        ) : step === "confirm" ? (
          <div className="p-5 space-y-4">
            <h3 className="font-display font-bold">Confirm Booking</h3>
            <div className="rounded-xl bg-secondary p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-semibold">{new Date(`${selectedDate}T${selectedTime}`).toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-semibold">{selectedTime} IST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-semibold">{duration} minutes</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Notes for mentor (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="What would you like to discuss?"
                className="mt-1 w-full rounded-xl border border-border bg-input p-3 text-sm outline-none focus:ring-1 focus:ring-primary resize-none h-20"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("select")} className="flex-1 rounded-xl">Back</Button>
              <Button onClick={handleBook} disabled={loading} className="flex-1 rounded-xl">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Booking"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Date selection */}
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Calendar className="h-4 w-4 text-primary" /> Select a date
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {dates.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDate(d.value)}
                    className={cn(
                      "flex flex-col items-center rounded-xl py-2 text-xs transition-all",
                      selectedDate === d.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <span className="text-[10px]">{d.day}</span>
                    <span className="font-bold text-sm">{d.date}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time selection */}
            {selectedDate && (
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Clock className="h-4 w-4 text-primary" /> Select a time
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {timeSlots.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={cn(
                        "rounded-lg py-2 text-xs font-medium transition-all",
                        selectedTime === t
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration */}
            {selectedTime && (
              <div>
                <p className="text-sm font-semibold mb-2">Session duration</p>
                <div className="flex gap-2">
                  {durations.map(d => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={cn(
                        "flex-1 rounded-lg py-2 text-xs font-medium transition-all",
                        duration === d.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => setStep("confirm")}
              disabled={!selectedDate || !selectedTime}
              className="w-full rounded-xl"
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
