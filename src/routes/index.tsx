import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Zap,
  Trophy,
  ShieldCheck,
  Clock,
  Smartphone,
  Gamepad2,
  ShoppingBag,
  Star,
  Mail,
  PlayCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  TrendingUp,
  Banknote,
  CircleDashed,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { useTaskStatuses, type TaskStatus } from "@/hooks/use-task-status";
import {
  track,
  getTrackingSummary,
  subscribeTracking,
  clearTrackingLog,
} from "@/lib/tracking";
import { Activity as ActivityIcon, BarChart3, MousePointerClick } from "lucide-react";
import { resolveAffiliateUrl } from "@/lib/affiliate.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zadaniomat.pl — Płatne zadania online, prowizje 5–30 zł" },
      {
        name: "description",
        content:
          "Zadaniomat.pl — wykonuj proste płatne zadania online i odbieraj prowizje od 5 do 30 zł. Wypłata środków w 24h.",
      },
      { property: "og:title", content: "Zadaniomat.pl — Płatne zadania online" },
      {
        property: "og:description",
        content: "Proste zadania, realne pieniądze. Prowizje 5–30 zł. Wypłata w 24h.",
      },
    ],
  }),
  component: Index,
});

const URL_1 = "https://price-low.eu/a/DkyOiO824HlqzR";
const URL_2 = "https://price-low.eu/a/BBwMT8ZlOcWKZr";
const URL_3 = "https://sungoclick.space/a/mZDzIWkD4sQ014";
const ALL_URLS = [URL_1, URL_2, URL_3];
const AFFILIATE_URL = URL_1;

// Build a fallback chain — primary first, then the other URLs as backups.
function chain(primary: string): string[] {
  return [primary, ...ALL_URLS.filter((u) => u !== primary)];
}

const SURVEY_DESC = "Załóż konto i wykonaj jedną ankietę.";
const INSTALL_DESC = "Zainstaluj aplikację i osiągnij poziom 1.";

type Task = {
  id: string;
  title: string;
  description: string;
  reward: number;
  time: string;
  icon: typeof Wallet;
  urls: string[];
  exclusive?: boolean;
};

const TASKS: Task[] = [
  { id: "1", title: "Zadanie 1", description: SURVEY_DESC, reward: 5, time: "3 min", icon: Mail, urls: chain(URL_1) },
  { id: "2", title: "Zadanie 2", description: SURVEY_DESC, reward: 7, time: "3 min", icon: Mail, urls: chain(URL_2) },
  { id: "3", title: "Zadanie 3", description: INSTALL_DESC, reward: 10, time: "5 min", icon: Gamepad2, urls: chain(URL_3) },
  { id: "4", title: "Zadanie 4", description: SURVEY_DESC, reward: 12, time: "4 min", icon: Mail, urls: chain(URL_1) },
  { id: "5", title: "Zadanie 5", description: SURVEY_DESC, reward: 15, time: "5 min", icon: Mail, urls: chain(URL_2) },
  { id: "6", title: "Zadanie 6", description: INSTALL_DESC, reward: 20, time: "6 min", icon: Smartphone, urls: chain(URL_3) },
  { id: "7", title: "Zadanie 7 — EXCLUSIVE", description: SURVEY_DESC, reward: 25, time: "6 min", icon: Sparkles, urls: chain(URL_1), exclusive: true },
  { id: "8", title: "Zadanie 8 — EXCLUSIVE", description: INSTALL_DESC, reward: 30, time: "8 min", icon: Trophy, urls: chain(URL_3), exclusive: true },
];

const FIRST_NAMES = [
  "Anna",
  "Kasia",
  "Marek",
  "Piotr",
  "Tomek",
  "Magda",
  "Ola",
  "Krzysiek",
  "Ewa",
  "Bartek",
  "Natalia",
  "Damian",
];
const CITIES = [
  "Warszawa",
  "Kraków",
  "Wrocław",
  "Poznań",
  "Gdańsk",
  "Łódź",
  "Lublin",
  "Katowice",
  "Szczecin",
  "Rzeszów",
];

const TESTIMONIALS = [
  {
    name: "Karolina W.",
    city: "Wrocław",
    text: "Wypłata dotarła w niecałe 12 godzin. Zadania są naprawdę proste, robię je w autobusie.",
    earned: 340,
  },
  {
    name: "Michał K.",
    city: "Gdańsk",
    text: "Najlepsza strona z mikrozadaniami jaką znalazłem. Exclusive za 30 zł to mega!",
    earned: 620,
  },
  {
    name: "Patrycja S.",
    city: "Kraków",
    text: "Sceptycznie podchodziłam, ale po pierwszej wypłacie 80 zł na konto — polecam każdemu.",
    earned: 215,
  },
  {
    name: "Adrian L.",
    city: "Poznań",
    text: "Dorabiam tu w wolnych chwilach. W miesiąc zebrałem prawie 500 zł bez wychodzenia z domu.",
    earned: 485,
  },
];

function go(source = "cta") {
  track("cta_click", { source, url: AFFILIATE_URL });
  openWithFallback([AFFILIATE_URL, URL_2, URL_3], { source });
}

function goTo(urls: string[], meta: { taskId?: string; reward?: number; source?: string } = {}) {
  openWithFallback(urls, meta);
}

// Opens a popup immediately (to satisfy popup blockers), resolves the first
// working affiliate URL on the server, then redirects the popup to it.
function openWithFallback(
  urls: string[],
  meta: { taskId?: string; reward?: number; source?: string } = {},
) {
  if (typeof window === "undefined") return;

  const fallback = urls[0];
  const popup = window.open("about:blank", "_blank", "noopener");

  // Show a tiny "checking link…" UI while we resolve.
  try {
    popup?.document?.write(
      `<title>Łączenie…</title><style>body{font:14px system-ui;background:#0b0b0e;color:#fff;display:grid;place-items:center;height:100vh;margin:0}</style><div>Łączenie z ofertą…</div>`,
    );
  } catch {
    /* cross-origin or sandboxed — ignore */
  }

  const navigate = (url: string, status: "primary" | "fallback" | "dead") => {
    track("affiliate_click", { url, status, ...meta });
    if (popup && !popup.closed) {
      try {
        popup.location.href = url;
        return;
      } catch {
        /* popup blocked us — fall through */
      }
    }
    // Popup was blocked: navigate the current tab as a last resort.
    window.location.href = url;
  };

  resolveAffiliateUrl({ data: { urls } })
    .then((res) => {
      if (res.allDead) navigate(res.url, "dead");
      else navigate(res.url, res.fallback ? "fallback" : "primary");
    })
    .catch(() => {
      // Network/server-fn failure — just use the primary URL.
      navigate(fallback, "primary");
    });
}

function Index() {
  useEffect(() => {
    track("page_view", { source: "index" });
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <LiveTicker />
      <Header />
      <Hero />
      <Stats />
      <TasksCarousel />
      <TrackingPanel />
      <HowItWorks />
      <Payout />
      <RecentActivity />
      <Testimonials />
      <FinalCTA />
      <Footer />
      <ActivityToast />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-8 z-40 mx-auto mt-3 flex w-[min(1200px,92%)] items-center justify-between rounded-full border border-border bg-card/70 px-5 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-money shadow-glow">
          <Banknote className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-display text-lg font-bold">Zadaniomat.pl</span>
      </div>
      <Button onClick={() => go("header")} size="sm" className="rounded-full bg-money text-primary-foreground hover:opacity-90">
        Zacznij zarabiać
      </Button>
    </header>
  );
}

function LiveTicker() {
  return (
    <div className="bg-primary/10 border-b border-primary/20 py-2 text-center text-xs font-medium text-primary">
      <span className="pulse-dot mr-2 inline-block h-2 w-2 rounded-full bg-primary align-middle" />
      LIVE · 38 osób zarabia w tej chwili · Dziś wypłacono 1 240 zł
    </div>
  );
}

function Hero() {
  return (
    <section className="relative bg-hero pb-24 pt-20">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="relative mx-auto w-[min(1200px,92%)] text-center">
        <Badge variant="outline" className="mb-6 border-primary/40 bg-primary/10 text-primary">
          <Zap className="mr-1 h-3 w-3" /> Nowe zadania co godzinę
        </Badge>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-[1.05] md:text-7xl">
          Zarabiaj <span className="text-money">5–30 zł</span> za proste
          zadania online
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Ankiety, instalacje aplikacji, mini gry. Wypłata w 24h przelewem,
          BLIK-iem lub na PayPal. Bez ukrytych opłat.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => go("hero_primary")}
            size="lg"
            className="h-14 rounded-full bg-money px-8 text-base font-semibold text-primary-foreground shadow-glow hover:opacity-90"
          >
            Odbierz pierwsze zadanie
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            onClick={() => go("hero_secondary")}
            size="lg"
            variant="outline"
            className="h-14 rounded-full border-border bg-card/50 px-8 text-base"
          >
            Zobacz wszystkie zadania
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Bezpieczne wypłaty</span>
          <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Pieniądze w 24h</span>
          <span className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> 4.9/5 · 312 opinii</span>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { label: "Aktywnych użytkowników", value: "1 842", icon: Users },
    { label: "Wypłacono łącznie", value: "47 320 zł", icon: Banknote },
    { label: "Średnio na osobę / msc", value: "180 zł", icon: TrendingUp },
    { label: "Dostępnych zadań dziś", value: "24", icon: Zap },
  ];
  return (
    <section className="mx-auto -mt-12 grid w-[min(1200px,92%)] grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label} className="bg-card-gradient shadow-card border-border p-5">
          <it.icon className="h-5 w-5 text-primary" />
          <div className="mt-3 text-2xl font-bold md:text-3xl">{it.value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{it.label}</div>
        </Card>
      ))}
    </section>
  );
}

function TasksCarousel() {
  const { store, setStatus, reset } = useTaskStatuses();

  const selected = TASKS.filter((t) => store[t.id] === "selected").length;
  const inProgress = TASKS.filter((t) => store[t.id] === "in_progress").length;
  const done = TASKS.filter((t) => store[t.id] === "done");
  const earned = done.reduce((sum, t) => sum + t.reward, 0);

  return (
    <section className="mx-auto mt-24 w-[min(1200px,92%)]">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-3 border-accent/40 bg-accent/10 text-accent">
            Dostępne zadania
          </Badge>
          <h2 className="text-3xl font-bold md:text-5xl">
            Wybierz zadanie i <span className="text-money">odbierz prowizję</span>
          </h2>
        </div>
      </div>

      {/* Progress panel */}
      <Card className="mb-6 flex flex-wrap items-center justify-between gap-4 border-border bg-card-gradient p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className="border-border bg-background/40">
            <CircleDashed className="mr-1 h-3 w-3" /> Wybrane: {selected}
          </Badge>
          <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent">
            <Loader2 className="mr-1 h-3 w-3" /> W trakcie: {inProgress}
          </Badge>
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Zrobione: {done.length}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Zgromadzona prowizja</div>
            <div className="text-xl font-extrabold text-money">{earned} zł</div>
          </div>
          {done.length + selected + inProgress > 0 && (
            <Button
              onClick={reset}
              size="sm"
              variant="outline"
              className="rounded-full border-border bg-background/40 text-xs"
            >
              <RotateCcw className="mr-1 h-3 w-3" /> Resetuj
            </Button>
          )}
        </div>
      </Card>

      <Carousel opts={{ align: "start", loop: true }} className="w-full">
        <CarouselContent className="-ml-4">
          {TASKS.map((t) => (
            <CarouselItem key={t.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <TaskCard
                task={t}
                status={store[t.id] ?? "none"}
                onStatus={(s) => setStatus(t.id, s)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-6 flex justify-end gap-2">
          <CarouselPrevious className="static translate-y-0 border-border bg-card hover:bg-secondary" />
          <CarouselNext className="static translate-y-0 border-border bg-card hover:bg-secondary" />
        </div>
      </Carousel>
    </section>
  );
}

const STATUS_META: Record<Exclude<TaskStatus, "none">, { label: string; icon: typeof CircleDashed; cls: string }> = {
  selected: { label: "Wybrane", icon: CircleDashed, cls: "bg-secondary text-secondary-foreground" },
  in_progress: { label: "W trakcie", icon: Loader2, cls: "bg-accent text-accent-foreground" },
  done: { label: "Zrobione", icon: CheckCircle2, cls: "bg-money text-primary-foreground" },
};

function TaskCard({
  task,
  status,
  onStatus,
}: {
  task: Task;
  status: TaskStatus;
  onStatus: (s: TaskStatus) => void;
}) {
  const Icon = task.icon;
  const isDone = status === "done";
  return (
    <Card
      className={`group relative flex h-full flex-col overflow-hidden border-border p-6 transition-all hover:-translate-y-1 hover:border-primary/50 ${
        task.exclusive ? "bg-card-gradient ring-2 ring-accent/60" : "bg-card-gradient"
      } ${isDone ? "opacity-90" : ""} shadow-card`}
    >
      {/* Big commission badge top-right */}
      <div className="absolute right-0 top-0 rounded-bl-2xl bg-money px-4 py-2 text-right shadow-glow">
        <div className="text-[10px] font-medium uppercase tracking-wide text-primary-foreground/80">Prowizja</div>
        <div className="text-2xl font-extrabold leading-none text-primary-foreground">+{task.reward} zł</div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {task.exclusive && (
          <Badge className="w-fit bg-accent text-accent-foreground hover:bg-accent">
            <Sparkles className="mr-1 h-3 w-3" /> EXCLUSIVE
          </Badge>
        )}
        {status !== "none" && (
          <Badge className={`${STATUS_META[status].cls} hover:opacity-90`}>
            {(() => {
              const I = STATUS_META[status].icon;
              return <I className={`mr-1 h-3 w-3 ${status === "in_progress" ? "animate-spin" : ""}`} />;
            })()}
            {STATUS_META[status].label}
          </Badge>
        )}
      </div>

      <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold">{task.title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{task.description}</p>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {task.time}</span>
        <span className="flex items-center gap-1 text-primary"><ShieldCheck className="h-3.5 w-3.5" /> Wypłata 24h</span>
      </div>

      <Button
        onClick={() => {
          if (!isDone) {
            onStatus("in_progress");
            track("task_start", { taskId: task.id, reward: task.reward, url: task.urls[0] });
          }
          goTo(task.urls, { taskId: task.id, reward: task.reward, source: "task_card" });
        }}
        className="mt-4 w-full rounded-xl bg-money font-semibold text-primary-foreground hover:opacity-90"
      >
        {isDone ? "Otwórz ponownie" : `Odbierz ${task.reward} zł`} <ArrowRight className="ml-1 h-4 w-4" />
      </Button>

      {/* Status controls */}
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <StatusBtn active={status === "selected"} onClick={() => {
          const next = status === "selected" ? "none" : "selected";
          onStatus(next);
          if (next === "selected") track("task_select", { taskId: task.id, reward: task.reward });
        }}>
          <CircleDashed className="h-3 w-3" /> Wybrane
        </StatusBtn>
        <StatusBtn active={status === "in_progress"} onClick={() => {
          const next = status === "in_progress" ? "none" : "in_progress";
          onStatus(next);
          if (next === "in_progress") track("task_start", { taskId: task.id, reward: task.reward });
        }}>
          <Loader2 className={`h-3 w-3 ${status === "in_progress" ? "animate-spin" : ""}`} /> W trakcie
        </StatusBtn>
        <StatusBtn active={isDone} onClick={() => {
          const next = isDone ? "none" : "done";
          onStatus(next);
          if (next === "done") track("task_done", { taskId: task.id, reward: task.reward });
        }}>
          <CheckCircle2 className="h-3 w-3" /> Zrobione
        </StatusBtn>
      </div>
    </Card>
  );
}

function StatusBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-medium transition ${
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border bg-background/40 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Zap,
      title: "Wybierz zadanie",
      text: "Przeglądaj listę aktualnych zadań — ankiety, instalacje, mini gry. Każde z jasno określoną prowizją.",
    },
    {
      icon: CheckCircle2,
      title: "Wykonaj w kilka minut",
      text: "Większość zadań zajmuje 2–10 minut. Nie potrzebujesz doświadczenia ani specjalnych umiejętności.",
    },
    {
      icon: Wallet,
      title: "Odbierz prowizję",
      text: "Środki trafiają na Twoje konto natychmiast. Wypłata już od 20 zł — przelew, BLIK lub PayPal.",
    },
  ];
  return (
    <section className="mx-auto mt-32 w-[min(1200px,92%)]">
      <div className="mb-12 text-center">
        <Badge variant="outline" className="mb-3 border-primary/40 bg-primary/10 text-primary">
          Jak to działa
        </Badge>
        <h2 className="text-3xl font-bold md:text-5xl">
          Proste zadania. <span className="text-money">Realne pieniądze.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Nie musisz być ekspertem. Wystarczy telefon lub komputer i kilka minut wolnego czasu.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <Card key={s.title} className="bg-card-gradient shadow-card relative border-border p-7">
            <div className="absolute -top-3 left-7 rounded-full bg-money px-3 py-0.5 text-xs font-bold text-primary-foreground">
              Krok {i + 1}
            </div>
            <s.icon className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Payout() {
  const methods = [
    { name: "Przelew bankowy", time: "do 24h", fee: "0 zł" },
    { name: "BLIK", time: "natychmiast", fee: "0 zł" },
    { name: "PayPal", time: "do 2h", fee: "0 zł" },
    { name: "Karta podarunkowa", time: "natychmiast", fee: "0 zł" },
  ];
  return (
    <section className="mx-auto mt-32 w-[min(1200px,92%)]">
      <Card className="relative overflow-hidden border-border bg-card-gradient p-8 shadow-card md:p-14">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative grid items-center gap-10 md:grid-cols-2">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/40 bg-primary/10 text-primary">
              <Wallet className="mr-1 h-3 w-3" /> Wypłata środków
            </Badge>
            <h2 className="text-3xl font-bold md:text-5xl">
              Zgromadzone środki na <span className="text-money">Twoim koncie w 24h</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Minimalna kwota wypłaty to 20 zł. Bez prowizji, bez ukrytych kosztów. Wybierz metodę
              która Ci odpowiada — wszystkie są w 100% bezpłatne.
            </p>
            <Button
              onClick={() => { track("payout_click", { source: "payout_section" }); go("payout"); }}
              size="lg"
              className="mt-6 h-12 rounded-full bg-money px-7 font-semibold text-primary-foreground shadow-glow hover:opacity-90"
            >
              Aktywuj konto wypłat
            </Button>
          </div>
          <div className="space-y-3">
            {methods.map((m) => (
              <div
                key={m.name}
                className="flex items-center justify-between rounded-2xl border border-border bg-background/40 p-4 backdrop-blur"
              >
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">Czas realizacji: {m.time}</div>
                </div>
                <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Prowizja {m.fee}</Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}

function RecentActivity() {
  const [items, setItems] = useState<Activity[]>([]);
  const [payouts, setPayouts] = useState<Activity[]>([]);

  useEffect(() => {
    setItems(generateActivity(8));
    setPayouts(generatePayouts(8));
    const t = setInterval(() => {
      setItems((prev) => [generateActivity(1)[0], ...prev.slice(0, 7)]);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="mx-auto mt-32 w-[min(1200px,92%)]">
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityList title="Ostatnio odebrane prowizje" subtitle="Live" icon={Zap} items={items} kind="reward" />
        <ActivityList title="Ostatnie wypłaty" subtitle="Live" icon={Banknote} items={payouts} kind="payout" />
      </div>
    </section>
  );
}

type Activity = { id: number; name: string; city: string; amount: number; task?: string };

function generateActivity(n: number): Activity[] {
  return Array.from({ length: n }).map((_, i) => ({
    id: Date.now() + i + Math.random(),
    name: pick(FIRST_NAMES) + " " + pick(["W.", "K.", "S.", "L.", "M.", "P.", "Z."]),
    city: pick(CITIES),
    amount: pick([5, 7, 10, 12, 15, 30]),
    task: pick(["ankietę", "instalację", "grę", "test premium", "rejestrację"]),
  }));
}

function generatePayouts(n: number): Activity[] {
  return Array.from({ length: n }).map((_, i) => ({
    id: i,
    name: pick(FIRST_NAMES) + " " + pick(["W.", "K.", "S.", "L.", "M.", "P."]),
    city: pick(CITIES),
    amount: pick([45, 60, 80, 110, 150, 220, 340, 480]),
  }));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ActivityList({
  title,
  subtitle,
  icon: Icon,
  items,
  kind,
}: {
  title: string;
  subtitle: string;
  icon: typeof Zap;
  items: Activity[];
  kind: "reward" | "payout";
}) {
  return (
    <Card className="bg-card-gradient shadow-card border-border p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-bold">{title}</h3>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary" />
          {subtitle}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((a) => (
          <div
            key={a.id}
            className="slide-in flex items-center justify-between rounded-xl bg-background/40 p-3 text-sm"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-money text-[11px] font-bold text-primary-foreground">
                {a.name[0]}
              </div>
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-muted-foreground">
                  {a.city}
                  {kind === "reward" && a.task ? ` · za ${a.task}` : ""}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-money">+{a.amount} zł</div>
              <div className="text-[10px] text-muted-foreground">
                {kind === "payout" ? "wypłacono" : "prowizja"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Testimonials() {
  return (
    <section className="mx-auto mt-32 w-[min(1200px,92%)]">
      <div className="mb-10 text-center">
        <Badge variant="outline" className="mb-3 border-accent/40 bg-accent/10 text-accent">
          Opinie użytkowników
        </Badge>
        <h2 className="text-3xl font-bold md:text-5xl">
          Tysiące osób już <span className="text-money">zarabia z nami</span>
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((t) => (
          <Card key={t.name} className="bg-card-gradient shadow-card border-border p-6">
            <div className="mb-3 flex gap-0.5 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">"{t.text}"</p>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.city}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Zarobił</div>
                <div className="font-bold text-money">{t.earned} zł</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="mx-auto mt-32 w-[min(1200px,92%)]">
      <Card className="relative overflow-hidden border-0 bg-money p-12 text-center shadow-glow md:p-20">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-4xl font-bold text-primary-foreground md:text-6xl">
            Twoje pierwsze 15 zł jest na wyciągnięcie ręki.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80">
            Dołącz do ponad 1 800 osób, które już zarabiają na prostych zadaniach online.
          </p>
          <Button
            onClick={() => go("final_cta")}
            size="lg"
            className="mt-8 h-14 rounded-full bg-background px-10 text-base font-bold text-foreground hover:bg-background/90"
          >
            Zacznij teraz — to za darmo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </Card>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto mt-20 w-[min(1200px,92%)] border-t border-border py-10 text-center text-sm text-muted-foreground">
      <div className="mb-3 flex items-center justify-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-money">
          <Banknote className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-foreground">Zadaniomat.pl</span>
      </div>
      © {new Date().getFullYear()} Zadaniomat.pl Wszelkie prawa zastrzeżone.
    </footer>
  );
}

function ActivityToast() {
  const [toast, setToast] = useState<{ name: string; city: string; amount: number } | null>(null);

  useEffect(() => {
    const show = () => {
      setToast({
        name: pick(FIRST_NAMES),
        city: pick(CITIES),
        amount: pick([5, 7, 10, 12, 15, 30]),
      });
      setTimeout(() => setToast(null), 4500);
    };
    const t1 = setTimeout(show, 3000);
    const t2 = setInterval(show, 9000);
    return () => {
      clearTimeout(t1);
      clearInterval(t2);
    };
  }, []);

  if (!toast) return null;
  return (
    <div className="slide-in fixed bottom-5 left-5 z-50 max-w-[300px] rounded-2xl border border-border bg-card/95 p-4 shadow-card backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-money text-sm font-bold text-primary-foreground">
          {toast.name[0]}
        </div>
        <div className="text-sm">
          <div className="font-semibold">{toast.name} z {toast.city}</div>
          <div className="text-muted-foreground">
            właśnie odebrał prowizję <span className="font-bold text-money">{toast.amount} zł</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackingPanel() {
  const [summary, setSummary] = useState(() => getTrackingSummary());
  useEffect(() => {
    setSummary(getTrackingSummary());
    const unsub = subscribeTracking(() => setSummary(getTrackingSummary()));
    return () => {
      unsub();
    };
  }, []);

  const totalClicks = summary.totals.affiliate_click || 0;
  const totalDone = summary.totals.task_done || 0;
  const totalStart = summary.totals.task_start || 0;
  const totalEarned = Object.values(summary.perTask).reduce((s, t) => s + t.reward, 0);
  const cr = totalClicks > 0 ? Math.round((totalDone / totalClicks) * 100) : 0;

  return (
    <section className="mx-auto mt-12 w-[min(1200px,92%)]">
      <Card className="border-border bg-card-gradient p-6 shadow-card">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Twój tracking</h3>
              <p className="text-xs text-muted-foreground">
                Sesja: <span className="font-mono">{summary.sid}</span> · {summary.count} zdarzeń
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => clearTrackingLog()}
            className="rounded-full border-border bg-background/40 text-xs"
          >
            <RotateCcw className="mr-1 h-3 w-3" /> Wyczyść
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat icon={MousePointerClick} label="Kliknięcia afiliacyjne" value={totalClicks} />
          <Stat icon={ActivityIcon} label="Rozpoczęte" value={totalStart} />
          <Stat icon={CheckCircle2} label="Ukończone" value={totalDone} />
          <Stat icon={Banknote} label="Zarobione" value={`${totalEarned} zł`} />
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          Konwersja kliknięcie → ukończenie: <span className="font-semibold text-foreground">{cr}%</span>
        </div>

        {Object.keys(summary.perTask).length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Zadanie</th>
                  <th className="py-2 pr-3">Kliknięcia</th>
                  <th className="py-2 pr-3">Ukończenia</th>
                  <th className="py-2">Prowizja</th>
                </tr>
              </thead>
              <tbody>
                {TASKS.filter((t) => summary.perTask[t.id]).map((t) => {
                  const row = summary.perTask[t.id];
                  return (
                    <tr key={t.id} className="border-t border-border/60">
                      <td className="py-2 pr-3 font-medium">{t.title}</td>
                      <td className="py-2 pr-3">{row.clicks}</td>
                      <td className="py-2 pr-3">{row.done}</td>
                      <td className="py-2 font-semibold text-money">{row.reward} zł</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BarChart3;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <Icon className="h-4 w-4 text-primary" />
      <div className="mt-2 text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
