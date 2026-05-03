import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Circle, ArrowRight, Video, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BookingModal } from "@/components/BookingModal";
import { useNavigate } from "react-router-dom";

const filters = ["All", "Technical", "Product", "Design", "Data", "Career"] as const;

type Mentor = {
  id: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  bio: string;
  skills: string[];
  match_score: number;
  category: string;
  available: boolean;
  avatar_color: string;
};

type Booking = {
  id: string;
  mentor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  jitsi_room_id: string;
  mentors: { name: string } | null;
};

const steps = [
  { title: "We analyze your skill gaps", desc: "Your quiz results and profile data reveal exactly where you need to improve." },
  { title: "We find mentors who mastered those exact skills", desc: "Our algorithm matches mentors who've successfully bridged similar gaps." },
  { title: "You get ranked matches with availability", desc: "See your best-fit mentors first, with real-time availability status." },
];

export default function Mentors() {
  const [filter, setFilter] = useState<string>("All");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const navigate = useNavigate();

  const loadMentors = async () => {
    const { data } = await supabase.from("mentors").select("*").order("match_score", { ascending: false });
    if (data) setMentors(data as Mentor[]);
  };

  const loadBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("bookings")
      .select("id, mentor_id, scheduled_at, duration_minutes, status, jitsi_room_id, mentors(name)")
      .eq("student_id", user.id)
      .order("scheduled_at", { ascending: true });
    if (data) setMyBookings(data as unknown as Booking[]);
  };

  useEffect(() => { loadMentors(); loadBookings(); }, []);

  const filtered = filter === "All" ? mentors : mentors.filter(m => m.category === filter);
  const upcomingBookings = myBookings.filter(b => b.status !== "cancelled" && new Date(b.scheduled_at) > new Date());

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-10">
        <h1 className="font-display text-2xl font-bold">Find Your Mentor</h1>
        <p className="text-sm text-muted-foreground mt-1">Matched to your skill gaps and target role</p>

        {/* Upcoming bookings */}
        {upcomingBookings.length > 0 && (
          <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/5 p-4">
            <h3 className="font-display font-bold text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" /> Upcoming Sessions
            </h3>
            <div className="mt-3 space-y-2">
              {upcomingBookings.map(b => {
                const isNow = new Date(b.scheduled_at) <= new Date(Date.now() + 15 * 60000);
                return (
                  <div key={b.id} className="flex items-center justify-between bg-card rounded-xl border border-border p-3">
                    <div>
                      <p className="text-sm font-semibold">{(b.mentors as any)?.name ?? "Mentor"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(b.scheduled_at).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })} at{" "}
                        {new Date(b.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        {" · "}{b.duration_minutes} min
                      </p>
                    </div>
                    {isNow && (
                      <Button
                        size="sm"
                        className="rounded-xl gap-1.5"
                        onClick={() => navigate(`/meeting/${b.jitsi_room_id}`)}
                      >
                        <Video className="h-3.5 w-3.5" /> Join Call
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="mt-5 flex flex-wrap gap-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold border transition-all",
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Mentor grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(m => {
            const matchColor = m.match_score >= 80 ? "text-accent bg-accent/15" : "text-warning bg-warning/15";
            return (
              <div key={m.id} className="relative bg-card border border-border rounded-2xl p-5 shadow-card hover:border-primary/30 transition-all">
                <span className={cn("absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full", matchColor)}>
                  {m.match_score}% Match
                </span>
                <div className="flex items-center gap-3">
                  <div className={cn("h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground", m.avatar_color)}>
                    {m.initials}
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.role} at {m.company}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {m.skills?.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-muted-foreground border border-border">{s}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{m.bio}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  <Circle className={cn("h-2.5 w-2.5 fill-current", m.available ? "text-accent" : "text-muted-foreground")} />
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {m.available ? "Available this week" : "Busy"}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 text-xs rounded-xl">View Profile</Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs rounded-xl"
                    disabled={!m.available}
                    onClick={() => setBookingMentor(m)}
                  >
                    Book Session
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* How matching works */}
        <section className="mt-10">
          <h2 className="font-display font-bold text-lg mb-4">How matching works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((s, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-card relative">
                <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold mb-3">{i + 1}</div>
                <h3 className="font-display font-bold text-sm">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
                {i < 2 && <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </section>
      </div>

      {bookingMentor && (
        <BookingModal
          mentor={bookingMentor}
          onClose={() => setBookingMentor(null)}
          onBooked={() => { loadBookings(); setBookingMentor(null); }}
        />
      )}
    </AppShell>
  );
}
