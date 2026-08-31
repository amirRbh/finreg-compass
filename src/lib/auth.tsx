import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Session courante. L'import du corpus est réservé aux comptes connectés. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_evenement, s) => {
      setSession(s);
      setPret(true);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setPret(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return { session, userId: session?.user.id ?? null, pret };
}
