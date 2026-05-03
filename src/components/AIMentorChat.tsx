import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Sparkles, GripHorizontal, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const INITIAL_MSG: Msg = {
  role: "assistant",
  content: "Hi! I'm your RIZE AI mentor. I can help with DSA, System Design, career advice, and interview prep. What would you like to work on?",
};

const MIN_W = 340;
const MIN_H = 420;
const DEFAULT_W = 380;
const DEFAULT_H = 520;

export function AIMentorChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; originW: number; originH: number } | null>(null);

  // Initialize position on open
  useEffect(() => {
    if (open && pos.x === 0 && pos.y === 0) {
      setPos({
        x: window.innerWidth - DEFAULT_W - 24,
        y: window.innerHeight - DEFAULT_H - 96,
      });
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Drag handlers
  const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (maximized) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = { startX: clientX, startY: clientY, originX: pos.x, originY: pos.y };

    const onMove = (ev: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;
      const cx = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
      const cy = "touches" in ev ? ev.touches[0].clientY : ev.clientY;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - size.w, dragRef.current.originX + cx - dragRef.current.startX)),
        y: Math.max(0, Math.min(window.innerHeight - size.h, dragRef.current.originY + cy - dragRef.current.startY)),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
  }, [pos, size, maximized]);

  // Resize handlers
  const onResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    resizeRef.current = { startX: clientX, startY: clientY, originW: size.w, originH: size.h };

    const onMove = (ev: MouseEvent | TouchEvent) => {
      if (!resizeRef.current) return;
      const cx = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
      const cy = "touches" in ev ? ev.touches[0].clientY : ev.clientY;
      setSize({
        w: Math.max(MIN_W, resizeRef.current.originW + cx - resizeRef.current.startX),
        h: Math.max(MIN_H, resizeRef.current.originH + cy - resizeRef.current.startY),
      });
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
  }, [size]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-mentor-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: allMsgs }),
        }
      );

      if (!resp.ok || !resp.body) throw new Error("Failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let added = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              const finalText = assistantText;
              if (!added) {
                added = true;
                setMessages(prev => [...prev, { role: "assistant", content: finalText }]);
              } else {
                setMessages(prev => {
                  const copy = [...prev];
                  copy[copy.length - 1] = { role: "assistant", content: finalText };
                  return copy;
                });
              }
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const panelStyle = maximized
    ? { left: 0, top: 0, width: "100vw", height: "100vh" }
    : { left: pos.x, top: pos.y, width: size.w, height: size.h };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200",
          "bg-gradient-to-br from-primary to-primary/80 hover:scale-105 active:scale-95",
          open && "rotate-45"
        )}
        aria-label="Open AI Mentor"
      >
        <Sparkles className="h-6 w-6 text-primary-foreground" />
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          style={{
            ...panelStyle,
            transition: maximized ? "all 200ms ease" : undefined,
          }}
        >
          {/* Draggable header */}
          <div
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
            className="flex items-center justify-between px-4 py-3 border-b border-border cursor-grab active:cursor-grabbing select-none bg-secondary/50"
          >
            <div className="flex items-center gap-2">
              <GripHorizontal className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm">RIZE AI Mentor</span>
                  <span className="h-2 w-2 rounded-full bg-accent" />
                </div>
                <p className="text-[10px] text-muted-foreground">Drag to move • Ask anything</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMaximized(m => !m)}
                className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                {maximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && !messages[messages.length - 1]?.content && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask your mentor..."
                className="flex-1 bg-input border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Resize handle (bottom-right corner) */}
          {!maximized && (
            <div
              onMouseDown={onResizeStart}
              onTouchStart={onResizeStart}
              className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize"
              style={{ background: "linear-gradient(135deg, transparent 50%, hsl(var(--muted-foreground) / 0.3) 50%)" }}
            />
          )}
        </div>
      )}
    </>
  );
}
