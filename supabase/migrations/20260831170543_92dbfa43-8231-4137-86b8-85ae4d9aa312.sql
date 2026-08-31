CREATE TABLE public.corpus_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id text NOT NULL UNIQUE,
  domaine text NOT NULL,
  type text NOT NULL,
  difficulte integer NOT NULL DEFAULT 1,
  question text NOT NULL,
  reponse_reference text NOT NULL,
  source_texte text NOT NULL DEFAULT '',
  source_article text NOT NULL DEFAULT '',
  source_adopte text NOT NULL DEFAULT '',
  source_url text NOT NULL DEFAULT '',
  source_juridiction text NOT NULL DEFAULT 'EU',
  source_langue text NOT NULL DEFAULT 'fr',
  source_precision text NOT NULL DEFAULT 'article',
  verification_statut text NOT NULL DEFAULT 'en_revue',
  verification_note text NOT NULL DEFAULT '',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.corpus_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.corpus_items TO authenticated;
GRANT ALL ON public.corpus_items TO service_role;

ALTER TABLE public.corpus_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Le corpus est public en lecture"
  ON public.corpus_items FOR SELECT USING (true);
CREATE POLICY "Un compte connecte importe ses items"
  ON public.corpus_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Un compte modifie ses items"
  ON public.corpus_items FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Un compte supprime ses items"
  ON public.corpus_items FOR DELETE TO authenticated USING (auth.uid() = created_by);

CREATE TABLE public.corpus_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item uuid NOT NULL REFERENCES public.corpus_items(id) ON DELETE CASCADE,
  modele_id text NOT NULL,
  texte text NOT NULL DEFAULT '',
  axe_exactitude integer NOT NULL DEFAULT 0,
  axe_sourcing integer NOT NULL DEFAULT 0,
  axe_calibration integer NOT NULL DEFAULT 0,
  axe_exploitabilite integer NOT NULL DEFAULT 0,
  score numeric NOT NULL DEFAULT 0,
  flags text[] NOT NULL DEFAULT '{}',
  analyse_correct text NOT NULL DEFAULT '',
  analyse_incorrect text NOT NULL DEFAULT '',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item, modele_id)
);

GRANT SELECT ON public.corpus_answers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.corpus_answers TO authenticated;
GRANT ALL ON public.corpus_answers TO service_role;

ALTER TABLE public.corpus_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les reponses sont publiques en lecture"
  ON public.corpus_answers FOR SELECT USING (true);
CREATE POLICY "Un compte connecte importe ses reponses"
  ON public.corpus_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Un compte modifie ses reponses"
  ON public.corpus_answers FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Un compte supprime ses reponses"
  ON public.corpus_answers FOR DELETE TO authenticated USING (auth.uid() = created_by);

CREATE OR REPLACE FUNCTION public.corpus_items_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER corpus_items_touch
BEFORE UPDATE ON public.corpus_items
FOR EACH ROW EXECUTE FUNCTION public.corpus_items_touch();