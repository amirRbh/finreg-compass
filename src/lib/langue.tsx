import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { definirLangueNombres } from "@/lib/finreg";

/**
 * Langue d'affichage du site. Le contenu mesuré (questions, réponses des
 * systèmes, sources officielles) reste dans sa langue d'origine : seule
 * l'interface et le texte éditorial sont traduits.
 *
 * Aucune persistance en localStorage : la langue vit dans l'URL (`?lang=fr`),
 * ce qui la rend partageable et conforme à la contrainte du projet.
 */
export type Langue = "en" | "fr";

type Contexte = {
  langue: Langue;
  definir: (l: Langue) => void;
  /** t(anglais, français) — renvoie la variante de la langue courante. */
  t: (en: string, fr: string) => string;
};

const ContexteLangue = createContext<Contexte | null>(null);

function estLangue(v: string | null): v is Langue {
  return v === "en" || v === "fr";
}

export function FournisseurLangue({ children }: { children: ReactNode }) {
  const [langue, setLangue] = useState<Langue>("en");

  // Lecture après hydratation : un état initial dépendant de `window` ferait
  // diverger le rendu serveur du rendu client.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("lang");
    if (estLangue(param) && param !== "en") {
      definirLangueNombres(param);
      setLangue(param);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = langue;
  }, [langue]);

  const definir = (l: Langue) => {
    definirLangueNombres(l);
    setLangue(l);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", l);
    window.history.replaceState(null, "", url);
  };

  const t = (en: string, fr: string) => (langue === "fr" ? fr : en);

  return (
    <ContexteLangue.Provider value={{ langue, definir, t }}>{children}</ContexteLangue.Provider>
  );
}

export function useLangue(): Contexte {
  const ctx = useContext(ContexteLangue);
  if (!ctx) return { langue: "en", definir: () => {}, t: (en) => en };
  return ctx;
}
