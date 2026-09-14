import { useState } from 'react'
import type { CompositionSet, Joueuse, Match } from '../types'
import CourtDiagram from './CourtDiagram'

export default function CompositionPage({
  matches,
  joueuses,
  compositions,
}: {
  matches: Match[]
  joueuses: Joueuse[]
  compositions: CompositionSet[]
}) {
  const [matchId, setMatchId] = useState(matches[0]?.id ?? '')
  const match = matches.find((m) => m.id === matchId)
  const setsDisponibles = match?.sets.map((s) => s.numero) ?? []
  const [setNumero, setSetNumero] = useState(setsDisponibles[0] ?? 1)

  const composition = compositions.find(
    (c) => c.matchId === matchId && c.setNumero === setNumero,
  )

  return (
    <div>
      <div className="comp-controls">
        <select
          value={matchId}
          onChange={(e) => {
            setMatchId(e.target.value)
            const premierSet = matches.find((m) => m.id === e.target.value)
              ?.sets[0]?.numero
            if (premierSet) setSetNumero(premierSet)
          }}
        >
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {new Date(m.date).toLocaleDateString('fr-FR')} — {m.adversaire}
            </option>
          ))}
        </select>

        <select
          value={setNumero}
          onChange={(e) => setSetNumero(Number(e.target.value))}
        >
          {setsDisponibles.map((n) => (
            <option key={n} value={n}>
              Set {n}
            </option>
          ))}
        </select>
      </div>

      <CourtDiagram composition={composition} joueuses={joueuses} />
      {composition && (
        <p className="legend">
          <span className="dot" /> poste joué différent du poste clé de la
          saison
        </p>
      )}
    </div>
  )
}
