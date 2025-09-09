import {
  signInWithGoogleAction,
  signInWithGithubAction,
  signInWithDiscordAction,
} from "@/lib/auth/actions";
import { Button } from "@/ui/button";

interface OAuthButtonsProps {
  mode: "signin" | "signup";
  next?: string;
}

function GoogleLogo() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GithubLogo() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function DiscordLogo() {
  return (
    <svg
      className="w-6 h-6"
      xmlns="http://www.w3.org/2000/svg"
      fill="#5865f2"
      viewBox="0 0 126.644 96"
    >
      <path d="M81.15 0c-1.2376 2.1973-2.3489 4.4704-3.3591 6.794-9.5975-1.4396-19.3718-1.4396-28.9945 0-.985-2.3236-2.1216-4.5967-3.3591-6.794-9.0166 1.5407-17.8059 4.2431-26.1405 8.0568C2.779 32.5304-1.6914 56.3725.5312 79.8863c9.6732 7.1476 20.5083 12.603 32.0505 16.0884 2.6014-3.4854 4.8998-7.1981 6.8698-11.0623-3.738-1.3891-7.3497-3.1318-10.8098-5.1523.9092-.6567 1.7932-1.3386 2.6519-1.9953 20.281 9.547 43.7696 9.547 64.0758 0 .8587.7072 1.7427 1.3891 2.6519 1.9953-3.4601 2.0457-7.0718 3.7632-10.835 5.1776 1.97 3.8642 4.2683 7.5769 6.8698 11.0623 11.5419-3.4854 22.3769-8.9156 32.0509-16.0631 2.626-27.2771-4.496-50.9172-18.817-71.8548C98.9811 4.2684 90.1918 1.5659 81.1752.0505L81.15 0ZM42.2802 65.4144c-6.2383 0-11.4159-5.6575-11.4159-12.6535s4.9755-12.6788 11.3907-12.6788 11.5169 5.708 11.4159 12.6788c-.101 6.9708-5.026 12.6535-11.3907 12.6535Zm42.0774 0c-6.2637 0-11.3907-5.6575-11.3907-12.6535s4.9755-12.6788 11.3907-12.6788 11.4917 5.708 11.3906 12.6788c-.101 6.9708-5.026 12.6535-11.3906 12.6535Z" />
    </svg>
  );
}

export function OAuthButtons({ mode, next }: OAuthButtonsProps) {
  const actionText = mode === "signin" ? "Sign in" : "Sign up";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="font-medium text-lg">{actionText} with</div>
      <div className="flex flex-row justify-center gap-4">
        <form action={signInWithGoogleAction}>
          {next && <input type="hidden" name="next" value={next} />}
          <Button icon size="lg" type="submit">
            <GoogleLogo />
          </Button>
        </form>
        <form action={signInWithGithubAction}>
          {next && <input type="hidden" name="next" value={next} />}
          <Button icon size="lg" type="submit">
            <GithubLogo />
          </Button>
        </form>
        <form action={signInWithDiscordAction}>
          {next && <input type="hidden" name="next" value={next} />}
          <Button icon size="lg" type="submit">
            <DiscordLogo />
          </Button>
        </form>
      </div>
    </div>
  );
}
