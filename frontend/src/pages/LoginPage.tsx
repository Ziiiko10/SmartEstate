import { type FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { getErrorMessage } from "../lib/api";
import { getHomeRouteForRole } from "../lib/roles";
import {
  APP_ROUTES,
  buildMailtoHref,
  DEMO_ACCOUNTS,
  DEMO_CREDENTIALS,
  type LoginRedirectState,
} from "../lib/smartestateApp";

const pageStyles = `.glass-panel {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(24px);
        }
        .text-gradient {
            background: linear-gradient(135deg, #000666 0%, #1b6d24 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }`;

const supportHref = buildMailtoHref(
  "Recuperation d'acces SmartEstate",
  "Bonjour,\n\nJ'ai besoin d'aide pour recuperer l'acces a mon compte SmartEstate.\n\nMerci.",
);

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [hint, setHint] = useState<null | string>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const routeState = (location.state as LoginRedirectState | null) ?? null;

  useEffect(() => {
    if (!routeState?.prefillDemo) {
      return;
    }

    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setHint("Les identifiants de demonstration ont ete pre-remplis.");
  }, [routeState?.prefillDemo]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setHint(null);
    setIsSubmitting(true);

    try {
      const authenticatedUser = await login({
        email,
        password,
        remember,
      });
      navigate(routeState?.from ?? getHomeRouteForRole(authenticatedUser.role), { replace: true });
    } catch (submissionError) {
      setError(getErrorMessage(submissionError, "Connexion impossible pour le moment."));
    } finally {
      setIsSubmitting(false);
    }
  }

  function fillDemoCredentials(provider: "Google" | "LinkedIn") {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setHint(`Mode demonstration ${provider} prepare avec le compte de test.`);
    setError(null);
  }

  function fillRoleCredentials(account: keyof typeof DEMO_ACCOUNTS) {
    const selectedAccount = DEMO_ACCOUNTS[account];
    setEmail(selectedAccount.email);
    setPassword(selectedAccount.password);
    setHint(`${selectedAccount.label} prepare avec les identifiants demandes.`);
    setError(null);
  }

  return (
    <ImportedPageDocument
      bodyClassName="bg-surface font-body text-on-surface antialiased"
      title="Connexion SmartEstate"
      styles={pageStyles}
    >
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden bg-primary-container">
          <img
            alt="High-end real estate"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-vXwosRHB6bVpX1QtAvVuM_CBlD9e4xzHG1dxld7oicNjPmPcSkz3FtyGQJPenxjKDLGgLaJ5yu7lgXzXcVr3muBRkM3NPOnkJXIeHHJT6WzcmBGnsKAZg8fZpKcZw55xm0YkDDuj8di1aBfXmKl2DLFTZl7ueRE4wV3kNccQ2v_dGVPuZBAgX2-TaWw_4ZoyTmQN9bgh90Yxw6nprRbKfYS3zmpn0E_EFTk2Sxb_h7pxfllFw2rbRmK-FalK7QzG4CC3bFa4L76e"
          />
          <div className="relative z-10 p-24 flex flex-col justify-between h-full w-full">
            <div>
              <h1 className="font-headline text-on-primary-fixed text-4xl font-extrabold tracking-tighter uppercase mb-2">
                SmartEstate
              </h1>
              <div className="h-1 w-12 bg-secondary rounded-full" />
            </div>
            <div className="max-w-xl">
              <p className="font-headline text-5xl font-bold text-white leading-tight mb-6">
                L'excellence au service de votre patrimoine immobilier.
              </p>
              <p className="text-on-primary-fixed-variant text-lg font-medium opacity-90 max-w-md">
                Analysez, optimisez et gerez vos actifs avec une precision institutionnelle
                grace a nos algorithmes predictifs.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <p className="text-white font-headline text-2xl font-bold">2.4B DH</p>
                <p className="text-on-primary-fixed-variant text-xs uppercase tracking-widest font-semibold mt-1">
                  Actifs analyses
                </p>
              </div>
              <div>
                <p className="text-white font-headline text-2xl font-bold">+18.5%</p>
                <p className="text-on-primary-fixed-variant text-xs uppercase tracking-widest font-semibold mt-1">
                  Rentabilite moyenne
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="w-full lg:w-5/12 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-surface-container-lowest">
          <div className="max-w-md w-full mx-auto">
            <header className="mb-12">
              <div className="lg:hidden mb-12">
                <span className="font-headline text-2xl font-extrabold tracking-tighter text-primary uppercase">
                  SmartEstate
                </span>
              </div>
              <span className="inline-block px-3 py-1 bg-surface-container text-on-surface-variant font-label text-[10px] font-bold uppercase tracking-[0.2em] mb-4 rounded-sm">
                Espace securise
              </span>
              <h2 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-2">
                Connexion a votre espace
              </h2>
              <p className="text-on-surface-variant font-medium">
                Veuillez renseigner vos identifiants pour acceder a votre interface SmartEstate.
              </p>
            </header>

            {error ? (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {hint ? (
              <div className="mb-6 rounded-lg border border-secondary/20 bg-secondary/5 px-4 py-3 text-sm text-secondary">
                {hint}
              </div>
            ) : null}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label
                  className="font-label text-xs font-bold text-on-surface uppercase tracking-wider"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-low border-none border-b border-outline-variant/15 focus:ring-0 focus:border-secondary transition-all px-4 py-4 rounded-lg placeholder:text-outline font-body text-sm"
                    id="email"
                    name="email"
                    placeholder="nom@institution.fr"
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">
                    <span className="material-symbols-outlined text-sm">alternate_email</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    className="font-label text-xs font-bold text-on-surface uppercase tracking-wider"
                    htmlFor="password"
                  >
                    Mot de passe
                  </label>
                  <a
                    className="text-[11px] font-bold text-secondary uppercase tracking-wider hover:opacity-80 transition-opacity"
                    href={supportHref}
                  >
                    Mot de passe oublie ?
                  </a>
                </div>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-low border-none border-b border-outline-variant/15 focus:ring-0 focus:border-secondary transition-all px-4 py-4 rounded-lg placeholder:text-outline font-body text-sm"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">
                    <span className="material-symbols-outlined text-sm">lock</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  checked={remember}
                  className="h-4 w-4 rounded border-outline-variant text-secondary focus:ring-secondary/20"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <label className="ml-3 block text-sm font-medium text-on-surface-variant" htmlFor="remember-me">
                  Se souvenir de moi
                </label>
              </div>

              <button
                className="w-full bg-gradient-to-br from-secondary to-on-secondary-container text-on-secondary font-headline font-bold py-4 px-6 rounded-lg shadow-[0_8px_20px_rgba(27,109,36,0.2)] hover:scale-[1.01] active:scale-95 transition-all duration-300 flex justify-center items-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Connexion..." : "Se connecter"}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>

            <div className="relative my-10">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="bg-surface-container-lowest px-4 text-outline font-label">
                  Ou continuer avec
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                className="flex items-center justify-center gap-3 py-3 px-4 bg-surface-container-low hover:bg-surface-container-high transition-colors rounded-lg font-label text-sm font-bold text-on-surface border border-outline-variant/5"
                type="button"
                data-disable-prototype-actions="true"
                onClick={() => fillDemoCredentials("Google")}
              >
                <img
                  alt="Google Logo"
                  className="w-5 h-5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLyaqeIBSkpbKWSLHGHm69ji9xXoI-O30X-Z0vqt6oT75vBgTIMAatM5RyTnMpcSlLORC3NDRL6v_Fhn4jcXZzGfqewssDpFl1AlC5eRsQOpqHifzjYwn-giXSXwZE8lk1b1FRlQwP_rvFnVGajuJtlgcCohuuUr7nXM5O4bAXUlH2tSqlAPeEcgVedRsIgnoI9-190XQoxY9n-uPJ9KbH7Gbx7H8yrsHq8HW523KfYxwk9DrFr6K1-FC8QupCTUvit-sBR7VvxHmL"
                />
                Google
              </button>
              <button
                className="flex items-center justify-center gap-3 py-3 px-4 bg-surface-container-low hover:bg-surface-container-high transition-colors rounded-lg font-label text-sm font-bold text-on-surface border border-outline-variant/5"
                type="button"
                data-disable-prototype-actions="true"
                onClick={() => fillDemoCredentials("LinkedIn")}
              >
                <svg className="w-5 h-5 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                LinkedIn
              </button>
            </div>

            <div className="mt-8 rounded-2xl border border-outline-variant/10 bg-white px-5 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                Acces rapide aux 3 interfaces
              </p>
              <p className="mt-2 text-sm text-on-surface-variant">
                Mot de passe commun: <span className="font-bold text-primary">123456789</span>
              </p>
              <div className="mt-4 grid gap-3">
                <button
                  className="rounded-xl border border-outline-variant/10 bg-surface-container-low px-4 py-3 text-left transition-colors hover:bg-surface-container-high"
                  type="button"
                  onClick={() => fillRoleCredentials("user")}
                >
                  <span className="block text-sm font-bold text-primary">Interface 1 · Utilisateur simple</span>
                  <span className="block text-xs text-on-surface-variant">{DEMO_ACCOUNTS.user.email}</span>
                </button>
                <button
                  className="rounded-xl border border-outline-variant/10 bg-surface-container-low px-4 py-3 text-left transition-colors hover:bg-surface-container-high"
                  type="button"
                  onClick={() => fillRoleCredentials("agent")}
                >
                  <span className="block text-sm font-bold text-primary">Interface 2 · Agent immobilier</span>
                  <span className="block text-xs text-on-surface-variant">{DEMO_ACCOUNTS.agent.email}</span>
                </button>
                <button
                  className="rounded-xl border border-outline-variant/10 bg-surface-container-low px-4 py-3 text-left transition-colors hover:bg-surface-container-high"
                  type="button"
                  onClick={() => fillRoleCredentials("admin")}
                >
                  <span className="block text-sm font-bold text-primary">Interface 3 · Administrateur</span>
                  <span className="block text-xs text-on-surface-variant">{DEMO_ACCOUNTS.admin.email}</span>
                </button>
              </div>
            </div>

            <footer className="mt-12 text-center">
              <p className="text-on-surface-variant text-sm font-medium">
                Pas encore de compte ?
                <Link className="text-secondary font-bold hover:underline ml-1" to={APP_ROUTES.signup}>
                  Creer un profil
                </Link>
              </p>
            </footer>
          </div>

          <div className="mt-24 text-[10px] text-outline-variant uppercase tracking-[0.3em] font-bold text-center lg:text-left">
            © 2024 SmartEstate Financial Group. Tous droits reserves.
          </div>
        </div>
      </div>
    </ImportedPageDocument>
  );
}
