import type { Match } from '../types'

function setsGagnes(match: Match) {
  return match.sets.filter((s) => s.pointsVLS > s.pointsAdv).length
}

function matchGagne(match: Match) {
  const gagnes = setsGagnes(match)
  return gagnes > match.sets.length - gagnes
}

function CarteMatch({
  match,
  onSelect,
}: {
  match: Match
  onSelect: (matchId: string) => void
}) {
  const joué = match.sets.length > 0
  const gagné = joué && matchGagne(match)

  return (
    <div
      className="match-card cliquable"
      onClick={() => onSelect(match.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect(match.id)
      }}
    >
      <div className="infos">
        <div className="date">
          {new Date(match.date).toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })}
          {' · '}
          {match.domicile ? 'Domicile' : 'Extérieur'}
        </div>
        <div className="adversaire">{match.adversaire}</div>
        <div className="lieu">{match.lieu}</div>
        {joué && (
          <div className="sets">
            {match.sets.map((s) => {
              const setGagné = s.pointsVLS > s.pointsAdv
              return (
                <span
                  key={s.numero}
                  className={`set-pill ${setGagné ? 'win' : 'loss'}`}
                >
                  {s.pointsVLS}–{s.pointsAdv}
                </span>
              )
            })}
          </div>
        )}
      </div>
      {joué ? (
        <div className={`issue ${gagné ? 'win' : 'loss'}`}>
          {gagné ? 'V' : 'D'}
        </div>
      ) : (
        <div className="issue a-venir">À venir</div>
      )}
    </div>
  )
}

export default function ResultsPage({
  matches,
  onSelect,
  onNouveauMatch,
}: {
  matches: Match[]
  onSelect: (matchId: string) => void
  onNouveauMatch: () => void
}) {
  const aVenir = matches
    .filter((m) => m.sets.length === 0)
    .sort((a, b) => (a.date > b.date ? 1 : -1)) // le plus proche d'abord

  const joués = matches
    .filter((m) => m.sets.length > 0)
    .sort((a, b) => (a.date < b.date ? 1 : -1)) // le plus récent d'abord

  return (
    <div>
      <div className="results-toolbar">
        <button className="btn-edit" onClick={onNouveauMatch}>
          + Nouveau match
        </button>
      </div>

      {aVenir.length > 0 && (
        <>
          <h3 className="section-label">À venir</h3>
          {aVenir.map((match) => (
            <CarteMatch key={match.id} match={match} onSelect={onSelect} />
          ))}
        </>
      )}

      {joués.length > 0 && (
        <>
          <h3 className="section-label">Résultats</h3>
          {joués.map((match) => (
            <CarteMatch key={match.id} match={match} onSelect={onSelect} />
          ))}
        </>
      )}

      {matches.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>
          Aucun match saisi pour l'instant.
        </p>
      )}
    </div>
  )
}
