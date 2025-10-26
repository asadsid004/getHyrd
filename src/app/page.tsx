import { SignInDialog } from "@/components/auth/signin-form";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonGroup } from "@/components/ui/button-group";

export default function Home() {
  return (
    <div className="relative min-h-screen text-foreground overflow-hidden">
      {/* Subtle Center Glow */}
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      {/* Header */}
      <header className="relative max-w-7xl mx-auto p-6 flex items-center justify-between">
        <Logo />
        <ButtonGroup>
          <ThemeToggle />
          <SignInDialog />
        </ButtonGroup>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-6xl mx-auto flex flex-col items-center text-center py-24 px-6">
        <h1 className="text-5xl sm:text-7xl tracking-tight leading-tight">
          Get{" "}
          <span className="text-gray-500 dark:text-gray-400 font-semibold">
            Hyrd
          </span>{" "}
          Faster <br /> — with AI
        </h1>
        <p className="text-lg text-muted-foreground mt-6 max-w-2xl">
          Your AI-powered career companion — find jobs, auto-apply, optimize
          resumes, and ace interviews. Smarter search. Seamless success.
        </p>
        <div className="mt-10">
          <SignInDialog />
        </div>
      </main>

      {/* Footer with Large HYRD Text */}
      <footer className="relative overflow-hidden -mt-27">
        {/* Large Outline Text */}
        <div className="relative h-[350px] flex items-start justify-center">
          <h2
            className="text-[20rem] sm:text-[25rem] lg:text-[30rem] font-black uppercase leading-none select-none pointer-events-none dark:text-neutral-800 text-neutral-300 italic"
            style={{
              WebkitTextStroke: "2px currentColor",
              WebkitTextFillColor: "transparent",
            }}
          >
            HYRD
          </h2>
        </div>
      </footer>
    </div>
  );
}
