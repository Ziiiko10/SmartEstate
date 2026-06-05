import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ImportedPageDocument from "../components/ImportedPageDocument";
import { getErrorMessage } from "../lib/api";
import { getHomeRouteForRole } from "../lib/roles";
import { APP_ROUTES } from "../lib/smartestateApp";

const pageStyles = `.material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      .editorial-shadow {
        box-shadow: 0 12px 40px rgba(26, 28, 29, 0.06);
      }
      .gradient-cta {
        background: linear-gradient(135deg, #1b6d24 0%, #217128 100%);
      }`;

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [hint, setHint] = useState<null | string>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setHint(null);

    if (password !== confirmPassword) {
      setError("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    if (!termsAccepted) {
      setError("Veuillez accepter les conditions d'utilisation pour continuer.");
      return;
    }

    setIsSubmitting(true);

    try {
      const registeredUser = await register({
        email,
        full_name: fullName,
        password,
        phone_number: `+212${phone.replace(/\s+/g, "")}`,
      });
      navigate(getHomeRouteForRole(registeredUser.role), { replace: true });
    } catch (submissionError) {
      setError(getErrorMessage(submissionError, "Inscription impossible pour le moment."));
    } finally {
      setIsSubmitting(false);
    }
  }

  function fillInvestorExample(provider: "Google" | "LinkedIn") {
    const providerValues =
      provider === "Google"
        ? {
            email: "investisseur.demo@smartestate.ma",
            fullName: "Yassine Mansouri",
            phone: "600000000",
          }
        : {
            email: "atlas.capital@smartestate.ma",
            fullName: "Leila Bennani",
            phone: "661112233",
          };

    setEmail(providerValues.email);
    setFullName(providerValues.fullName);
    setPhone(providerValues.phone);
    setHint(`Profil ${provider} pre-rempli. Il ne reste plus qu'a definir votre mot de passe.`);
    setError(null);
  }

  return (
    <ImportedPageDocument
      bodyClassName="bg-background text-on-background font-body overflow-x-hidden"
      title="Creer un compte SmartEstate"
      styles={pageStyles}
    >
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <section className="relative hidden overflow-hidden bg-primary p-12 lg:flex lg:min-h-screen lg:w-1/2 lg:items-center lg:justify-center">
          <div className="absolute inset-0 z-0">
            <img
              className="h-full w-full object-cover opacity-40"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT4qMj5ysQJDKcmvSbX_W3qQvsy3Wxj7a89qHIBfoX2w2vthq3oY2Xqlpi0ektx5sWui6VNafRN6BIL4KIph6f1BSpVP8NyzLMfT50o0Ka4-2yeEAANrHFCbYZ6lG8QMk8M09JuamkL9jaw-8r2stiuojUKhf3GR2tNwgo4V-Ec6T4KsE7F8SUKFeRDe1peM2RAMhbsTXC2oKy9h3TKnO_cxAZgkwcdNTeAX6D08nc5ePcBabrdK5iO3XygIlezbgdS8WBLaX2i2CI"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
          </div>

          <div className="relative z-10 max-w-lg">
            <div className="mb-12">
              <h1 className="mb-6 font-headline text-5xl font-extrabold leading-tight tracking-tight text-white">
                L&apos;excellence immobiliere au Maroc, digitalisee.
              </h1>
              <p className="text-xl leading-relaxed text-primary-fixed opacity-90">
                Accedez a des analyses institutionnelles, des scenarios predictifs et une
                gestion de portefeuille de classe mondiale.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-3xl text-secondary-fixed">
                  analytics
                </span>
                <div>
                  <h3 className="font-headline text-lg font-bold text-white">
                    Estimations precises
                  </h3>
                  <p className="text-sm text-primary-fixed opacity-80">
                    Algorithmes proprietaires bases sur les donnees reelles du marche
                    marocain.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-3xl text-secondary-fixed">
                  shield
                </span>
                <div>
                  <h3 className="font-headline text-lg font-bold text-white">
                    Securite institutionnelle
                  </h3>
                  <p className="text-sm text-primary-fixed opacity-80">
                    Infrastructure robuste pour la protection de vos actifs et de vos
                    donnees.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-12 left-12 right-12 hidden items-center justify-between text-xs uppercase tracking-widest text-primary-fixed-dim opacity-60 xl:flex">
            <span>© 2024 SmartEstate Morocco</span>
            <span>Casablanca • Marrakech • Tanger</span>
          </div>
        </section>

        <main className="flex min-h-screen w-full flex-1 flex-col items-center justify-center bg-background p-6 sm:p-12 lg:w-1/2 lg:p-24">
          <div className="w-full max-w-md">
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <span className="material-symbols-outlined text-3xl text-primary">domain</span>
              <span className="font-headline text-2xl font-black tracking-tighter text-primary">
                SmartEstate Morocco
              </span>
            </div>

            <header className="mb-10">
              <h2 className="mb-3 font-headline text-3xl font-extrabold tracking-tight text-primary">
                Creer mon compte
              </h2>
              <p className="font-medium text-on-surface-variant">
                Rejoignez l&apos;ecosysteme immobilier intelligent SmartEstate.
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

            <div className="mb-10 grid grid-cols-2 gap-4">
              <button
                className="group editorial-shadow flex items-center justify-center gap-3 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 transition-all hover:bg-surface-bright"
                type="button"
                data-disable-prototype-actions="true"
                onClick={() => fillInvestorExample("Google")}
              >
                <img
                  alt="Google"
                  className="h-5 w-5 grayscale transition-all group-hover:grayscale-0"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ5HXNNtX76vC3rpsVak5Cc9Huu0NAvFqs4fEN4fWNY02qOOzPEN9C4Fy0Nrc8ZBAK43HOXm5O-KsjVf_CI1z4jMH3XyBOoQy0zSby3DcXpLCNVTa11kwSiTxS5DjIlsoR6Jy_MkTUQw_u_cCxDWlms5wiw1bxrEccYNuot1YZJdAIEoROh3n49SMo1RED_SlnRUgoLFu2mamvZup5SE0itZm8UK33JmcVdFLIE3bp1NLBl_MZIBG6gqzDD-qMRV3Pl_xMdNWHLNno"
                />
                <span className="text-sm font-semibold text-on-surface">Google</span>
              </button>

              <button
                className="group editorial-shadow flex items-center justify-center gap-3 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 transition-all hover:bg-surface-bright"
                type="button"
                data-disable-prototype-actions="true"
                onClick={() => fillInvestorExample("LinkedIn")}
              >
                <svg className="h-5 w-5 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="text-sm font-semibold text-on-surface">LinkedIn</span>
              </button>
            </div>

            <div className="relative mb-10 flex items-center">
              <div className="flex-grow border-t border-outline-variant/30" />
              <span className="mx-4 flex-shrink text-xs font-label uppercase tracking-widest text-on-surface-variant">
                Ou par e-mail
              </span>
              <div className="flex-grow border-t border-outline-variant/30" />
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="group">
                <label
                  className="mb-2 block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant transition-colors group-focus-within:text-primary"
                  htmlFor="full_name"
                >
                  Nom complet
                </label>
                <input
                  className="w-full border-b-2 border-transparent bg-surface-container-low px-0 py-3 font-medium text-on-surface transition-all placeholder:text-outline/50 focus:border-primary focus:ring-0"
                  id="full_name"
                  name="full_name"
                  placeholder="Yassine Mansouri"
                  required
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </div>

              <div className="group">
                <label
                  className="mb-2 block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant transition-colors group-focus-within:text-primary"
                  htmlFor="email"
                >
                  E-mail professionnel
                </label>
                <input
                  className="w-full border-b-2 border-transparent bg-surface-container-low px-0 py-3 font-medium text-on-surface transition-all placeholder:text-outline/50 focus:border-primary focus:ring-0"
                  id="email"
                  name="email"
                  placeholder="yassine@exemple.ma"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="group">
                <label
                  className="mb-2 block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant transition-colors group-focus-within:text-primary"
                  htmlFor="phone"
                >
                  Telephone
                </label>
                <div className="flex items-center gap-4 border-b-2 border-transparent bg-surface-container-low transition-all focus-within:border-primary">
                  <span className="py-3 pl-0 font-semibold text-on-surface">+212</span>
                  <input
                    className="w-full border-none bg-transparent px-0 py-3 font-medium text-on-surface placeholder:text-outline/50 focus:ring-0"
                    id="phone"
                    name="phone"
                    placeholder="6 00 00 00 00"
                    required
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="group">
                  <label
                    className="mb-2 block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant transition-colors group-focus-within:text-primary"
                    htmlFor="password"
                  >
                    Mot de passe
                  </label>
                  <input
                    className="w-full border-b-2 border-transparent bg-surface-container-low px-0 py-3 font-medium text-on-surface transition-all placeholder:text-outline/50 focus:border-primary focus:ring-0"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>

                <div className="group">
                  <label
                    className="mb-2 block text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant transition-colors group-focus-within:text-primary"
                    htmlFor="confirm_password"
                  >
                    Confirmation
                  </label>
                  <input
                    className="w-full border-b-2 border-transparent bg-surface-container-low px-0 py-3 font-medium text-on-surface transition-all placeholder:text-outline/50 focus:border-primary focus:ring-0"
                    id="confirm_password"
                    name="confirm_password"
                    placeholder="••••••••"
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 py-2">
                <div className="flex h-5 items-center">
                  <input
                    checked={termsAccepted}
                    className="h-4 w-4 rounded border-outline-variant text-secondary focus:ring-secondary/20"
                    id="terms"
                    name="terms"
                    type="checkbox"
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                  />
                </div>
                <div className="text-sm">
                  <label className="text-on-surface-variant" htmlFor="terms">
                    J&apos;accepte les{" "}
                    <a className="font-bold text-primary hover:underline" href="#">
                      Conditions d&apos;utilisation
                    </a>{" "}
                    et la{" "}
                    <a className="font-bold text-primary hover:underline" href="#">
                      Politique de confidentialite
                    </a>
                    .
                  </label>
                </div>
              </div>

              <button
                className="gradient-cta flex w-full items-center justify-center gap-2 rounded-lg py-4 font-headline font-bold text-white shadow-lg shadow-secondary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? "Creation..." : "Creer mon compte"}</span>
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            </form>

            <footer className="mt-12 text-center">
              <p className="font-medium text-on-surface-variant">
                Deja membre ?{" "}
                <Link
                  className="group inline-flex flex-col items-center font-bold text-secondary hover:underline"
                  to={APP_ROUTES.login}
                >
                  <span>Se connecter</span>
                  <span className="h-0.5 w-0 bg-secondary transition-all duration-300 group-hover:w-full" />
                </Link>
              </p>
            </footer>
          </div>
        </main>

        <div className="pointer-events-none fixed bottom-0 right-0 h-64 w-64 translate-x-20 translate-y-20 rotate-12 opacity-[0.03]">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.7,-31.3,87,-15.7,85.6,-0.8C84.2,14.1,78,28.2,69.5,40.4C61,52.6,50.1,62.8,37.5,70.1C24.9,77.4,10.6,81.8,-3.2,87.4C-17,93,-30.3,99.8,-42.9,96.8C-55.5,93.8,-67.4,81.1,-75.4,66.8C-83.4,52.5,-87.5,36.5,-89.2,20.8C-90.9,5.1,-90.2,-10.3,-84.9,-24C-79.6,-37.7,-69.7,-49.6,-57.8,-58C-45.9,-66.4,-32.1,-71.3,-18.3,-75C-4.5,-78.7,9.3,-81.1,44.7,-76.4Z"
              fill="#000666"
              transform="translate(100 100)"
            />
          </svg>
        </div>
      </div>
    </ImportedPageDocument>
  );
}
