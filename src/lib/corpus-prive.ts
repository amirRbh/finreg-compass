export type DemandeCorpusPrive = {
  nom: string;
  societe: string;
  email: string;
  message: string;
};

/**
 * Placeholder d'envoi. À brancher plus tard sur un service d'envoi
 * (fonction serveur, e-mail transactionnel ou CRM). Aucune donnée n'est
 * transmise ni stockée en l'état.
 */
export async function envoyerDemandeCorpusPrive(demande: DemandeCorpusPrive): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (import.meta.env.DEV) {
    console.info("[corpus-prive] demande à transmettre", {
      ...demande,
      email: demande.email ? "renseigné" : "absent",
    });
  }
}
