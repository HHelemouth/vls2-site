import type { Match } from '../types'

function setsGagnes(match: Match) {
  return match.sets.filter((s) => s.pointsVLS > s.pointsAdv).length
}

function matchGagne(match: Match) {
  const gagnes = setsGagnes(match)
  return gagnes > match.sets.length - gagnes
}

export default function ResultsPage({
  matches,
  onSelect,
}: {
  matches: Match[]
  onSelect: (matchId: string) => void
}) {
  const triés = [...matches].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div>
      {triés.map((match) => {
        const joué = match.sets.length > 0
        const gagné = joué && matchGagne(match)
        return (
          <div
            className="match-card cliquable"
            key={match.id}
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
      })}
      {triés.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>
          Aucun match saisi pour l'instant.
        </p>
      )}
    </div>
  )
}
