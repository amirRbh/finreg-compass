import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Page, Panneau, Titre } from "@/components/finreg/Chrome";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/lib/auth";
import { useLangue } from "@/lib/langue";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — FinReg corpus import" },
      {
        name: "description",
        content:
          "Sign in to import your own financial-regulation questions, reference answers and official sources into the FinReg corpus.",
      },
      { property: "og:title", content: "Sign in — FinReg corpus import" },
      {
        property: "og:description",
        content: "Access reserved for the accounts that maintain the published benchmark corpus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Authentification,
});

function Authentification() {
  const { t } = useLangue();
  const navigate = useNavigate();
  const { session, pret } = useSession();
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    if (pret && session) navigate({ to: "/import" });
  }, [pret, session, navigate]);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnCours(true);
    try {
      if (mode === "connexion") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: motDePasse,
          options: { emailRedirectTo: `${window.location.origin}/import` },
        });
        if (error) throw error;
        toast.success(
          t("Account created. You can sign in.", "Compte créé. Vous pouvez vous connecter."),
        );
        setMode("connexion");
      }
    } catch (erreur) {
      toast.error(erreur instanceof Error ? erreur.message : String(erreur));
    } finally {
      setEnCours(false);
    }
  };

  const google = async () => {
    const resultat = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (resultat.error) {
      toast.error(resultat.error.message ?? t("Sign-in failed.", "Connexion impossible."));
      return;
    }
    if (resultat.redirected) return;
    navigate({ to: "/import" });
  };

  return (
    <Page>
      <Titre
        etiquette={t("Corpus maintenance", "Maintenance du corpus")}
        titre={t("Sign in", "Connexion")}
        chapeau={t(
          "Importing questions changes what the public benchmark shows. Only signed-in accounts can write to the corpus, and each account can only edit what it imported.",
          "Importer des questions change ce que le benchmark public affiche. Seuls les comptes connectés écrivent dans le corpus, et chacun ne modifie que ce qu'il a importé.",
        )}
      />

      <Panneau className="mt-8 max-w-md p-6">
        <form onSubmit={soumettre} className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="etiquette">{t("Email", "Adresse e-mail")}</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:border-accent"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="etiquette">{t("Password", "Mot de passe")}</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete={mode === "connexion" ? "current-password" : "new-password"}
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:border-accent"
            />
          </label>
          <button
            type="submit"
            disabled={enCours}
            className="border border-foreground bg-foreground px-3 py-2 font-mono text-[11px] tracking-[0.08em] text-background uppercase disabled:opacity-50"
          >
            {mode === "connexion" ? t("Sign in", "Se connecter") : t("Create account", "Créer le compte")}
          </button>
        </form>

        <div className="mt-5 border-t border-rule pt-5">
          <button
            type="button"
            onClick={google}
            className="w-full border border-border px-3 py-2 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors hover:border-foreground"
          >
            {t("Continue with Google", "Continuer avec Google")}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "connexion" ? "inscription" : "connexion")}
            className="mt-4 font-mono text-[11px] text-muted-foreground underline decoration-rule underline-offset-4 hover:text-accent"
          >
            {mode === "connexion"
              ? t("No account yet? Create one", "Pas encore de compte ? En créer un")
              : t("Already have an account? Sign in", "Déjà un compte ? Se connecter")}
          </button>
        </div>
      </Panneau>
    </Page>
  );
}
