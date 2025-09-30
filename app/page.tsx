import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted">
      <section className="container mx-auto flex max-w-2xl flex-col gap-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Welcome to your Ramadan Form Next.js starter
          </h1>
          <p className="text-muted-foreground">
            This project is pre-configured with Tailwind CSS, shadcn/ui, Radix UI primitives, ESLint,
            Prettier, and testing libraries so you can focus on building.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg">Explore components</Button>
          <Button variant="outline" size="lg">
            Get started
          </Button>
        </div>
      </section>
    </main>
  );
}
