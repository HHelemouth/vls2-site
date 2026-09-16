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

      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.5rem' }}>
        Base minimale pour l'instant : victoires/défaites, taux de sets gagnés
        et fréquence des changements de poste. D'autres indicateurs (efficacité
        par poste, rotations les plus gagnantes, séries en cours) viendront une
        fois qu'il y aura plus de matchs réels saisis.
      </p>
    </div>
  )
}
