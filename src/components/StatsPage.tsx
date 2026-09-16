import type { CompositionSet, Joueuse, Match } from '../types'

export default function StatsPage({
  matches,
  joueuses,
  compositions,
}: {
  matches: Match[]
  joueuses: Joueuse[]
  compositions: CompositionSet[]
}) {
  const matchsJoués = matches.length
  let victoires = 0
  let setsGagnés = 0
  let setsJoués = 0

  matches.forEach((m) => {
    const gagnésIci = m.sets.filter((s) => s.pointsVLS > s.pointsAdv).length
    setsGagnés += gagnésIci
    setsJoués += m.sets.length
    if (gagnésIci > m.sets.length - gagnésIci) victoires += 1
  })

  const tauxSets = setsJoués ? Math.round((setsGagnés / setsJoués) * 100) : 0

  const changementsParJoueuse = new Map<string, number>()
  compositions.forEach((c) => {
    c.affectations.forEach((a) => {
      const j = joueuses.find((j) => j.id === a.joueuseId)
      if (j && j.posteCle !== a.posteJoue) {
        changementsParJoueuse.set(
          j.id,
          (changementsParJoueuse.get(j.id) ?? 0) + 1,
        )
      }
    })
  })

  // Statistiques par ligne (association de 2+ joueur·ses) : pour chaque
  // paire présente dans une ligne, sets joués ensemble et taux de victoire.
  const statsParPaire = new Map<
    string,
    { noms: string; joués: number; gagnés: number }
  >()

  compositions.forEach((comp) => {
    const match = matches.find((m) => m.id === comp.matchId)
    const set = match?.sets.find((s) => s.numero === comp.setNumero)
    if (!set) return
    const gagné = set.pointsVLS > set.pointsAdv

    ;(comp.lignes ?? []).forEach((ligne) => {
      for (let i = 0; i < ligne.joueuseIds.length; i++) {
        for (let j = i + 1; j < ligne.joueuseIds.length; j++) {
          const paire = [ligne.joueuseIds[i], ligne.joueuseIds[j]].sort()
          const clé = paire.join('|')
          const noms = paire
            .map((id) => joueuses.find((j) => j.id === id)?.nom ?? '?')
            .join(' + ')
          const entrée = statsParPaire.get(clé) ?? { noms, joués: 0, gagnés: 0 }
          entrée.joués += 1
          if (gagné) entrée.gagnés += 1
          statsParPaire.set(clé, entrée)
        }
      }
    })
  })

  const paires = Array.from(statsParPaire.values()).sort(
    (a, b) => b.joués - a.joués,
  )

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="valeur">
            {victoires}/{matchsJoués}
          </div>
          <div className="label">Matchs gagnés</div>
        </div>
        <div className="stat-card">
          <div className="valeur">{tauxSets}%</div>
          <div className="label">Sets gagnés ({setsGagnés}/{setsJoués})</div>
        </div>
        <div className="stat-card">
          <div className="valeur">{compositions.length}</div>
          <div className="label">Sets avec compo saisie</div>
        </div>
      </div>

      <div className="table-scroll">
        <table className="postes-table">
          <thead>
            <tr>
              <th>Joueur·se</th>
              <th>Poste clé (saison)</th>
              <th>Changements de poste observés</th>
            </tr>
          </thead>
          <tbody>
            {joueuses.map((j) => (
              <tr key={j.id}>
                <td>
                  {j.nom} <span style={{ color: 'var(--text-muted)' }}>#{j.numero}</span>
                </td>
                <td>{j.posteCle}</td>
                <td>{changementsParJoueuse.get(j.id) ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="section-label">Lignes</h3>
      {paires.length > 0 ? (
        <div className="table-scroll">
          <table className="postes-table">
            <thead>
              <tr>
                <th>Association</th>
                <th>Sets joués ensemble</th>
                <th>Taux de victoire</th>
              </tr>
            </thead>
            <tbody>
              {paires.map((p) => (
                <tr key={p.noms}>
                  <td>{p.noms}</td>
                  <td>{p.joués}</td>
                  <td>
                    {Math.round((p.gagnés / p.joués) * 100)}% ({p.gagnés}/{p.joués})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Aucune ligne renseignée pour l'instant — groupe des joueur·ses
          "sur la même ligne" en modifiant un set pour voir apparaître ces
          stats.
        </p>
      )}

      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.5rem' }}>
        D'autres indicateurs (efficacité par poste, séries en cours) viendront
        une fois qu'il y aura plus de matchs réels saisis.
      </p>
    </div>
  )
}
