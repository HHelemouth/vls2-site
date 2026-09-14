import type { CompositionSet, Joueuse, Match } from '../types'
import CourtDiagram from './CourtDiagram'

function setGagné(pointsVLS: number, pointsAdv: number) {
  return pointsVLS > pointsAdv
}

export default function MatchDetailPage({
  match,
  joueuses,
  compositions,
  onBack,
  onEdit,
}: {
  match: Match
  joueuses: Joueuse[]
  compositions: CompositionSet[]
  onBack: () => void
  onEdit: () => void
}) {
  const setsGagnés = match.sets.filter((s) =>
    setGagné(s.pointsVLS, s.pointsAdv),
  ).length
  const gagné = setsGagnés > match.sets.length - setsGagnés

  return (
    <div>
      <button className="lien-retour" onClick={onBack}>
        ← Tous les matchs
      </button>

      <div className="detail-header">
        <div>
          <div className="date">
            {new Date(match.date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
            {' · '}
            {match.domicile ? 'Domicile' : 'Extérieur'}
          </div>
          <h2>{match.adversaire}</h2>
          <div className="lieu">{match.lieu}</div>
        </div>
        <div className={`issue issue-large ${gagné ? 'win' : 'loss'}`}>
          {gagné ? 'Victoire' : 'Défaite'}
        </div>
      </div>

      <button className="btn-edit" onClick={onEdit}>
        Modifier ce match
      </button>

      {match.sets.map((set) => {
        const composition = compositions.find(
          (c) => c.matchId === match.id && c.setNumero === set.numero,
        )
        const changements = composition
          ? composition.affectations.filter((a) => {
              const j = joueuses.find((j) => j.id === a.joueuseId)
              return j && j.posteCle !== a.posteJoue
            }).length
          : 0

        return (
          <div className="set-block" key={set.numero}>
            <div className="set-block-header">
              <h3>Set {set.numero}</h3>
              <span
                className={`set-pill ${
                  setGagné(set.pointsVLS, set.pointsAdv) ? 'win' : 'loss'
                }`}
              >
                {set.pointsVLS}–{set.pointsAdv}
              </span>
              {changements > 0 && (
                <span className="changement-tag">
                  {changements} changement{changements > 1 ? 's' : ''} de
                  poste
                </span>
              )}
            </div>
            <CourtDiagram composition={composition} joueuses={joueuses} />
          </div>
        )
      })}

      <p className="legend">
        <span className="dot" /> poste joué différent du poste clé de la
        saison
      </p>
    </div>
  )
}
