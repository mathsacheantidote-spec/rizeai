import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Clock, Video, User, CheckCircle2, XCircle,
  Star, MessageSquare, Settings, Loader2
} from "lucide-react";

type Booking = {
  id: string;
  student_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  jitsi_room_id: string;
  notes: string;
};

type Feedback = {
  id: string;
  booking_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export default function MentorDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "past" | "feedback">("upcoming");

  // Availability state
  const [availSlots, setAvailSlots] = useState<{ day: number; start: string; end: string }[]>([]);
  const [newDay, setNewDay] = useState(1);
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("17:00");

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: mentor } = await supabase.from("mentors").select("id").eq("user_id", user.id).single();
    if (!mentor) { setLoading(false); return; }
    setMentorId(mentor.id);

    const [bookingsRes, availRes, feedbackRes] = await Promise.all([
      supabase.from("bookings").select("*").eq("mentor_id", mentor.id).order("scheduled_at", { ascending: true }),
      supabase.from("mentor_availability").select("*").eq("mentor_id", mentor.id),
      supabase.from("session_feedback").select("*").in(
        "booking_id",
        (await supabase.from("bookings").select("id").eq("mentor_id", mentor.id)).data?.map(b => b.id) ?? []
      ),
    ]);

    if (bookingsRes.data) setBookings(bookingsRes.data);
    if (availRes.data) setAvailSlots(availRes.data.map(a => ({ day: a.day_of_week, start: a.start_time, end: a.end_time })));
    if (feedbackRes.data) setFeedback(feedbackRes.data);
    setLoading(false);
  };

  const updateBookingStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    toast({ title: `Booking ${status}` });
    loadData();
  };

  const addAvailability = async () => {
    if (!mentorId) return;
    await supabase.from("mentor_availability").insert({
      mentor_id: mentorId,
      day_of_week: newDay,
      start_time: newStart,
      end_time: newEnd,
    });
    toast({ title: "Availability added" });
    loadData();
  };

  const now = new Date();
  const upcoming = bookings.filter(b => new Date(b.scheduled_at) > now && b.status !== "cancelled");
  const past = bookings.filter(b => new Date(b.scheduled_at) <= now || b.status === "completed" || b.status === "cancelled");

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!mentorId) {
    return (
      <AppShell>
        <div className="px-5 pt-6 pb-10 text-center">
          <h1 className="font-display text-2xl font-bold">Mentor Dashboard</h1>
          <p className="mt-4 text-muted-foreground">You don't have a mentor profile yet. Contact admin to get set up.</p>
        </div>
      </AppShell>
    );
  }

  const avgRating = feedback.length > 0 ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : "—";

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Mentor Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your sessions and availability</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Upcoming", value: upcoming.length, icon: Calendar, color: "text-primary" },
            { label: "Completed", value: past.filter(b => b.status === "completed").length, icon: CheckCircle2, color: "text-accent" },
            { label: "Avg Rating", value: avgRating, icon: Star, color: "text-warning" },
            { label: "Reviews", value: feedback.length, icon: MessageSquare, color: "text-primary" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
              <s.icon className={cn("h-5 w-5 mx-auto", s.color)} />
              <p className="mt-2 text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 border-b border-border pb-0">
          {(["upcoming", "past", "feedback"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2 text-sm font-semibold border-b-2 transition-all capitalize",
                tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-4 space-y-3">
          {tab === "upcoming" && (
            <>
              {upcoming.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No upcoming sessions</p>}
              {upcoming.map(b => {
                const isNow = new Date(b.scheduled_at) <= new Date(Date.now() + 15 * 60000);
                return (
                  <div key={b.id} className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-semibold">Student</span>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                            b.status === "confirmed" ? "bg-accent/15 text-accent" : "bg-warning/15 text-warning"
                          )}>{b.status}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(b.scheduled_at).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(b.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span>{b.duration_minutes} min</span>
                        </div>
                        {b.notes && <p className="mt-2 text-xs text-muted-foreground italic">"{b.notes}"</p>}
                      </div>
                      <div className="flex gap-2">
                        {b.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => updateBookingStatus(b.id, "confirmed")}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-xl text-xs text-destructive" onClick={() => updateBookingStatus(b.id, "cancelled")}>
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Decline
                            </Button>
                          </>
                        )}
                        {isNow && b.status === "confirmed" && (
                          <Button size="sm" className="rounded-xl text-xs gap-1.5" onClick={() => navigate(`/meeting/${b.jitsi_room_id}`)}>
                            <Video className="h-3.5 w-3.5" /> Join Call
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {tab === "past" && (
            <>
              {past.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No past sessions</p>}
              {past.map(b => (
                <div key={b.id} className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Session on {new Date(b.scheduled_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
                      <p className="text-xs text-muted-foreground">{b.duration_minutes} min · {b.status}</p>
                    </div>
                    {b.status !== "completed" && b.status !== "cancelled" && (
                      <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => updateBookingStatus(b.id, "completed")}>
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === "feedback" && (
            <>
              {feedback.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No feedback yet</p>}
              {feedback.map(f => (
                <div key={f.id} className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-4 w-4", i < f.rating ? "text-warning fill-warning" : "text-muted")} />
                    ))}
                    <span className="ml-2 text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</span>
                  </div>
                  {f.comment && <p className="text-sm text-muted-foreground">{f.comment}</p>}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Availability management */}
        <section className="mt-8">
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" /> Manage Availability
          </h2>
          <div className="mt-4 bg-card border border-border rounded-2xl p-5">
            <div className="flex flex-wrap gap-2 mb-4">
              {availSlots.map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-secondary text-xs font-medium">
                  {dayLabels[s.day]} {s.start}–{s.end}
                </span>
              ))}
              {availSlots.length === 0 && <p className="text-sm text-muted-foreground">No availability set</p>}
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Day</label>
                <select value={newDay} onChange={e => setNewDay(Number(e.target.value))} className="mt-1 block w-full rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none">
                  {dayLabels.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">From</label>
                <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)} className="mt-1 block rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">To</label>
                <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} className="mt-1 block rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none" />
              </div>
              <Button onClick={addAvailability} className="rounded-xl">Add Slot</Button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
