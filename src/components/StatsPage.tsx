import type { CompositionSet, Joueuse, Match, PositionTerrain } from '../types'

const AVANT: PositionTerrain[] = ['P2', 'P3', 'P4']
const ARRIÈRE: PositionTerrain[] = ['P1', 'P5', 'P6']

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

  // Stats par ligne : qui se trouve ensemble en ligne avant (au filet) ou
  // en ligne arrière sur un set, et le taux de victoire de ce set-là.
  // Calculé directement à partir des positions du terrain, rien à saisir
  // en plus.
  const statsParLigne = new Map<
    string,
    { noms: string; ligne: 'Avant' | 'Arrière'; joués: number; gagnés: number }
  >()

  compositions.forEach((comp) => {
    const match = matches.find((m) => m.id === comp.matchId)
    const set = match?.sets.find((s) => s.numero === comp.setNumero)
    if (!set) return
    const gagné = set.pointsVLS > set.pointsAdv

    ;([
      ['Avant', AVANT],
      ['Arrière', ARRIÈRE],
    ] as const).forEach(([label, positions]) => {
      const ids = positions
        .map((pos) => comp.affectations.find((a) => a.position === pos)?.joueuseId)
        .filter((id): id is string => Boolean(id))

      if (ids.length < 2) return

      // Toutes les paires possibles au sein de cette ligne.
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const paire = [ids[i], ids[j]].sort()
          const clé = `${label}|${paire.join('|')}`
          const noms = paire
            .map((id) => joueuses.find((j) => j.id === id)?.nom ?? '?')
            .join(' + ')
          const entrée =
            statsParLigne.get(clé) ?? { noms, ligne: label, joués: 0, gagnés: 0 }
          entrée.joués += 1
          if (gagné) entrée.gagnés += 1
          statsParLigne.set(clé, entrée)
        }
      }
    })
  })

  const lignes = Array.from(statsParLigne.values()).sort(
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

      <h3 className="section-label">Associations par ligne</h3>
      {lignes.length > 0 ? (
        <div className="table-scroll">
          <table className="postes-table">
            <thead>
              <tr>
                <th>Association</th>
                <th>Ligne</th>
                <th>Sets joués ensemble</th>
                <th>Taux de victoire</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={`${l.ligne}-${l.noms}`}>
                  <td>{l.noms}</td>
                  <td>{l.ligne}</td>
                  <td>{l.joués}</td>
                  <td>
                    {Math.round((l.gagnés / l.joués) * 100)}% ({l.gagnés}/{l.joués})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Dès que des compositions complètes (ligne avant et/ou arrière)
          seront saisies sur des sets joués, les associations qui gagnent le
          plus souvent apparaîtront ici automatiquement.
        </p>
      )}

      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.5rem' }}>
        D'autres indicateurs (efficacité par poste, séries en cours) viendront
        une fois qu'il y aura plus de matchs réels saisis.
      </p>
    </div>
  )
}
