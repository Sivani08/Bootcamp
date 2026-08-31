import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});

function VocabStreakLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
              <Flame className="size-6 fill-white" />
            </span>
            <div>
              <span className="text-base font-extrabold tracking-tight">VocabStreak AI</span>
              <span className="block text-[10px] text-muted-foreground font-medium">Communication Mastery</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-amber-500 px-5 text-xs font-bold text-white shadow-md transition-all hover:bg-amber-600"
            >
              <span>Start Your Streak</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20 mx-auto">
            <Sparkles className="size-4" />
            <span>AI-Powered Communication Development</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
            One Word a Day. <br />
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              One Step Closer to Better Communication.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Learn high-impact corporate vocabulary, construct 3 original sentences, speak aloud into your microphone, and evaluate your recall with AI-driven feedback.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/auth"
              className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 text-sm font-bold text-white shadow-lg transition-all hover:from-amber-600 hover:to-orange-600"
            >
              <Flame className="size-5 fill-white" />
              <span>Start Your Streak Free</span>
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <span>How It Works</span>
            </a>
          </div>
        </section>

        {/* 4-Step Learning Workflow Showcase */}
        <section id="how-it-works" className="border-t border-border bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-6 space-y-12">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">The Daily 4-Stage Workflow</h2>
              <p className="text-sm text-muted-foreground">
                You must complete all 4 mandatory stages every calendar day to earn your daily streak 🔥
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Step 1 */}
              <div className="panel p-6 space-y-4 relative border-t-4 border-t-amber-500">
                <span className="grid size-12 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                  <BookOpen className="size-6" />
                </span>
                <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">Stage 1</span>
                <h3 className="text-lg font-bold text-foreground">1. Learn</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Understand morphological prefixes, roots, suffixes, etymology, phonetic pronunciation 🔊, and business examples.
                </p>
              </div>

              {/* Step 2 */}
              <div className="panel p-6 space-y-4 relative border-t-4 border-t-blue-500">
                <span className="grid size-12 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
                  <PenTool className="size-6" />
                </span>
                <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">Stage 2</span>
                <h3 className="text-lg font-bold text-foreground">2. Write</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Write 3 original sentences. AI evaluates Vocabulary Usage (30%), Grammar (25%), Context (20%), Structure (15%), and Naturalness (10%).
                </p>
              </div>

              {/* Step 3 */}
              <div className="panel p-6 space-y-4 relative border-t-4 border-t-purple-500">
                <span className="grid size-12 place-items-center rounded-xl bg-purple-500/10 text-purple-500">
                  <Mic className="size-6" />
                </span>
                <span className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400">Stage 3</span>
                <h3 className="text-lg font-bold text-foreground">3. Speak</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Speak a sentence using your microphone. Speech-to-text transcribes your audio and provides pronunciation, fluency & grammar feedback.
                </p>
              </div>

              {/* Step 4 */}
              <div className="panel p-6 space-y-4 relative border-t-4 border-t-emerald-500">
                <span className="grid size-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <RotateCcw className="size-6" />
                </span>
                <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">Stage 4</span>
                <h3 className="text-lg font-bold text-foreground">4. Recall</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Without looking back, provide one synonym and one antonym for semantic AI validation before unlocking your daily streak 🔥
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
