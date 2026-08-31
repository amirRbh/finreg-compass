#!/usr/bin/env python3
"""
FinReg run harness.

Puts every item of scripts/corpus-source.json to each evaluated system through
the Lovable AI gateway, then has an independent judge model score the answer on
the four published axes (0-2) against the expected answer and its legal source.

Writes:
  scripts/execution-brute.json     raw answers + judgments, one entry per item/system
  scripts/reponses-mesurees.json   the shape scripts/construire-donnees.mjs consumes
  scripts/execution-metadonnees.json  run date, model list, judge, protocol

No aggregate is computed here: construire-donnees.mjs recomputes every published
figure from the item-level scores.

  python3 scripts/executer-run.py            # full run
  python3 scripts/executer-run.py --limit 2  # smoke test on two items
"""

import argparse
import json
import os
import random
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from pathlib import Path

import requests

RACINE = Path(__file__).resolve().parent.parent
GATEWAY = "https://ai.gateway.lovable.dev/v1"
CLE = os.environ.get("LOVABLE_API_KEY")

# Systems under evaluation. Real, named models: the ranking is nominative.
SYSTEMES = [
    {"id": "gpt-5-4", "modele": "openai/gpt-5.4", "nom": "GPT-5.4", "profil": "OpenAI · frontier"},
    {
        "id": "gpt-5-4-mini",
        "modele": "openai/gpt-5.4-mini",
        "nom": "GPT-5.4 mini",
        "profil": "OpenAI · compact",
    },
    {
        "id": "gemini-3-7-flash",
        "modele": "google/gemini-3.7-flash",
        "nom": "Gemini 3.7 Flash",
        "profil": "Google · fast tier",
    },
    {
        "id": "gemini-3-1-flash-lite",
        "modele": "google/gemini-3.1-flash-lite",
        "nom": "Gemini 3.1 Flash Lite",
        "profil": "Google · cost tier",
    },
    {
        "id": "gemini-2-5-pro",
        "modele": "google/gemini-2.5-pro",
        "nom": "Gemini 2.5 Pro",
        "profil": "Google · reasoning tier",
    },
    {
        "id": "claude-opus-5",
        "modele": "anthropic/claude-opus-5",
        "nom": "Claude Opus 5",
        "profil": "Anthropic · frontier",
    },
    {
        "id": "claude-sonnet-5",
        "modele": "anthropic/claude-sonnet-5",
        "nom": "Claude Sonnet 5",
        "profil": "Anthropic · balanced",
    },
    {
        "id": "claude-haiku-4-5",
        "modele": "anthropic/claude-haiku-4-5-20251001",
        "nom": "Claude Haiku 4.5",
        "profil": "Anthropic · cost tier",
    },
]

CLE_ANTHROPIC = os.environ.get("ANTHROPIC_API_KEY")
ANTHROPIC = "https://api.anthropic.com/v1/messages"

JUGE = "openai/gpt-5.5"

# Published system prompt, identical for every system (see /methodology).
PROMPT_SYSTEME = """You are answering questions on French and European Union
financial regulation.

Rules:
1. Answer only on the basis of texts applicable at the stated date.
   Do not rely on any repealed text.
2. Always cite the source: title of the act, article number, and where
   relevant the delegated act or the position of the supervisory authority.
3. Never cite a reference you are not certain exists. Where you are unsure
   of a reference, say so explicitly: "reference not verifiable".
4. Where the question cannot be settled without a further element of fact,
   state the applicable rule and then the missing condition.
5. If you do not know, answer "I cannot answer this reliably" without
   presenting a hypothesis as law.
6. Expected format: three parts — Qualification, Legal basis, Caveats.
   No more than 250 words."""

PROMPT_JUGE = """You are the scoring judge of a regulatory-accuracy benchmark.
You score one answer given by a language model to one question on French and EU
financial regulation, against the expected answer and its verified legal source.

Scale, 0 to 2 per axis, applied strictly:

exactitude (legal accuracy) — 2: the rule stated is the one the applicable text
lays down, completely. 1: right in principle, incomplete or imprecise. 0: wrong,
or based on a text that does not apply.
sourcing (citation accuracy) — 2: act and article exact, level 1 and level 2
distinguished. 1: real reference but imprecise or partial. 0: reference
non-existent, repealed, or off point.
calibration — 2: caveats explicit and warranted, declines where that is the
right call. 1: overconfident but no factual error. 0: categorical and wrong.
exploitabilite (usability) — 2: three-part structure respected, conditions and
deadlines explicit. 1: usable after rework. 0: unusable or off format.

Flags, only when they apply:
hallucination_source — cites an act, article or authority position that does not
exist, or that does not carry the rule attributed to it.
erreur_disqualifiante — a compliance professional acting on this answer would
breach the rule.
sourcing_incomplet — the rule is right but the citation is missing or partial.
surconfiance — categorical where the text leaves a condition open.
abstention — the model declined to state the rule.

Judge the substance, not the wording, and do not reward verbosity. A citation
that differs from the expected source is not wrong if it exists and carries the
same rule; it is hallucination_source if it does not.

Write the appreciation and both analyses in English, whatever the language of
the answer under review.

appreciation: one sentence, factual, describing what this answer did — it is
published next to the score.
analyse_correct / analyse_incorrect: what the model got right, and the exact
point where it went wrong (empty strings only for a flawless answer)."""

SCHEMA_JUGE = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "exactitude": {"type": "integer", "enum": [0, 1, 2]},
        "sourcing": {"type": "integer", "enum": [0, 1, 2]},
        "calibration": {"type": "integer", "enum": [0, 1, 2]},
        "exploitabilite": {"type": "integer", "enum": [0, 1, 2]},
        "flags": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": [
                    "hallucination_source",
                    "erreur_disqualifiante",
                    "sourcing_incomplet",
                    "surconfiance",
                    "abstention",
                ],
            },
        },
        "appreciation": {"type": "string"},
        "analyse_correct": {"type": "string"},
        "analyse_incorrect": {"type": "string"},
    },
    "required": [
        "exactitude",
        "sourcing",
        "calibration",
        "exploitabilite",
        "flags",
        "appreciation",
        "analyse_correct",
        "analyse_incorrect",
    ],
}


def entetes():
    return {
        "Content-Type": "application/json",
        "Lovable-API-Key": CLE,
        "X-Lovable-AIG-SDK": "fetch",
    }


def _post(chemin, corps, flux):
    """One gateway call, with bounded backoff on 429/5xx. Terminal statuses raise."""
    for tentative in range(6):
        reponse = requests.post(
            f"{GATEWAY}{chemin}", headers=entetes(), json=corps, stream=flux, timeout=900
        )
        if reponse.status_code < 400:
            return reponse
        if reponse.status_code in (429,) or reponse.status_code >= 500:
            attente = float(reponse.headers.get("Retry-After") or 2**tentative)
            time.sleep(attente + random.random())
            continue
        raise RuntimeError(f"{chemin} [{reponse.status_code}] {reponse.text[:400]}")
    raise RuntimeError(f"{chemin}: rate limited after 6 attempts")


def _sse_texte(reponse):
    """Accumulates output_text deltas of a streamed /v1/responses call."""
    morceaux = []
    for ligne in reponse.iter_lines(decode_unicode=True):
        if not ligne or not ligne.startswith("data:"):
            continue
        charge = ligne[5:].strip()
        if charge == "[DONE]":
            break
        try:
            evenement = json.loads(charge)
        except json.JSONDecodeError:
            continue
        if evenement.get("type") == "response.output_text.delta":
            morceaux.append(evenement.get("delta", ""))
        elif evenement.get("type") == "response.completed":
            if not morceaux:
                sortie = evenement.get("response", {}).get("output_text")
                if sortie:
                    morceaux.append(sortie)
    return "".join(morceaux).strip()


def _anthropic(modele, question, budget):
    """Direct Anthropic call: these models are not served by the gateway."""
    corps = {
        "model": modele.split("/", 1)[1],
        "max_tokens": min(budget, 4000),
        "temperature": 0.2,
        "system": PROMPT_SYSTEME,
        "messages": [{"role": "user", "content": question}],
    }
    entetes_anthropic = {
        "content-type": "application/json",
        "x-api-key": CLE_ANTHROPIC,
        "anthropic-version": "2023-06-01",
    }
    for tentative in range(6):
        reponse = requests.post(ANTHROPIC, headers=entetes_anthropic, json=corps, timeout=900)
        if reponse.status_code < 400:
            blocs = reponse.json().get("content", [])
            return "".join(b.get("text", "") for b in blocs if b.get("type") == "text").strip()
        if reponse.status_code == 429 or reponse.status_code >= 500:
            attente = float(reponse.headers.get("retry-after") or 2**tentative)
            time.sleep(attente + random.random())
            continue
        raise RuntimeError(f"anthropic [{reponse.status_code}] {reponse.text[:400]}")
    raise RuntimeError("anthropic: rate limited after 6 attempts")


def repondre(modele, question, budget=4000):
    """Puts one question to one system, in an independent session."""
    if modele.startswith("anthropic/"):
        return _anthropic(modele, question, budget)
    if modele.startswith("openai/"):
        reponse = _post(
            "/responses",
            {
                "model": modele,
                "instructions": PROMPT_SYSTEME,
                "input": question,
                "stream": True,
                "max_output_tokens": budget,
            },
            flux=True,
        )
        return _sse_texte(reponse)
    reponse = _post(
        "/chat/completions",
        {
            "model": modele,
            "temperature": 0.2,
            "max_tokens": 4000,
            "messages": [
                {"role": "system", "content": PROMPT_SYSTEME},
                {"role": "user", "content": question},
            ],
        },
        flux=False,
    )
    return (reponse.json()["choices"][0]["message"]["content"] or "").strip()


def noter(item, reponse_modele, budget=6000):
    """Independent judgment of one answer, structured against the published rubric."""
    entree = json.dumps(
        {
            "question": item["question"],
            "expected_answer": item["reponse_reference"],
            "verified_source": item["source"],
            "question_type": item["type"],
            "difficulty": item["difficulte"],
            "model_answer": reponse_modele,
        },
        ensure_ascii=False,
        indent=2,
    )
    flux = _post(
        "/responses",
        {
            "model": JUGE,
            "instructions": PROMPT_JUGE,
            "input": f"Score this answer and return json.\n\n{entree}",
            "stream": True,
            "max_output_tokens": budget,
            "reasoning": {"effort": "low"},
            "text": {
                "format": {
                    "type": "json_schema",
                    "name": "notation",
                    "strict": True,
                    "schema": SCHEMA_JUGE,
                }
            },
        },
        flux=True,
    )
    return _sse_texte(flux)


CACHE = RACINE / "scripts/.cache-run"


def traiter(item, systeme):
    """One item against one system, then judged. Cached, so a run can resume."""
    cache = CACHE / f"{item['id']}__{systeme['id']}.json"
    if cache.exists():
        return json.loads(cache.read_text())

    texte = ""
    for budget in (4000, 10000):
        texte = repondre(systeme["modele"], item["question"], budget)
        if texte:
            break
    if not texte:
        raise RuntimeError(f"{item['id']}/{systeme['id']}: empty answer")

    # A reasoning judge can spend its whole budget thinking and return no text:
    # widen the budget rather than publish a score that was never produced.
    notation = None
    for budget in (6000, 14000, 24000):
        brut = noter(item, texte, budget)
        if brut:
            notation = json.loads(brut)
            break
    if notation is None:
        raise RuntimeError(f"{item['id']}/{systeme['id']}: judge returned no verdict")

    sortie = {
        "item": item["id"],
        "systeme": systeme["id"],
        "modele": systeme["modele"],
        "reponse": texte,
        "notation": notation,
    }
    cache.write_text(json.dumps(sortie, ensure_ascii=False, indent=2))
    return sortie


def main():
    if not CLE:
        sys.exit("LOVABLE_API_KEY missing")
    analyseur = argparse.ArgumentParser()
    analyseur.add_argument("--limit", type=int, default=0)
    analyseur.add_argument("--workers", type=int, default=4)
    # Systems the account cannot currently reach are excluded rather than
    # published with missing answers: the ranking only names systems that answered.
    analyseur.add_argument("--exclure", default="")
    args = analyseur.parse_args()

    exclus = {i.strip() for i in args.exclure.split(",") if i.strip()}
    systemes = [s for s in SYSTEMES if s["id"] not in exclus]

    CACHE.mkdir(exist_ok=True)
    corpus = json.loads((RACINE / "scripts/corpus-source.json").read_text())
    if args.limit:
        corpus = corpus[: args.limit]

    taches = [(item, systeme) for item in corpus for systeme in systemes]
    resultats = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        for i, sortie in enumerate(pool.map(lambda t: traiter(*t), taches), 1):
            resultats.append(sortie)
            print(
                f"{i}/{len(taches)}  {sortie['item']}  {sortie['systeme']}  "
                f"flags={','.join(sortie['notation']['flags']) or '-'}",
                flush=True,
            )

    par_item = {}
    for sortie in resultats:
        n = sortie["notation"]
        grave = any(
            f in ("hallucination_source", "erreur_disqualifiante") for f in n["flags"]
        )
        analyse = (
            {"correct": n["analyse_correct"], "incorrect": n["analyse_incorrect"]}
            if grave
            else None
        )
        par_item.setdefault(sortie["item"], []).append(
            [
                sortie["systeme"],
                sortie["reponse"],
                [n["exactitude"], n["sourcing"], n["calibration"], n["exploitabilite"]],
                n["flags"],
                analyse,
            ]
        )

    ecrire = lambda chemin, valeur: (RACINE / chemin).write_text(
        json.dumps(valeur, ensure_ascii=False, indent=2) + "\n"
    )
    ecrire("scripts/execution-brute.json", resultats)
    ecrire("scripts/reponses-mesurees.json", par_item)
    ecrire(
        "scripts/execution-metadonnees.json",
        {
            "date_execution": date.today().isoformat(),
            "nb_runs": 1,
            "juge": JUGE,
            "systemes": [
                {"id": s["id"], "nom": s["nom"], "profil": s["profil"], "modele": s["modele"]}
                for s in systemes
            ],
        },
    )
    print(f"done: {len(resultats)} judged answers over {len(corpus)} items")


if __name__ == "__main__":
    main()
