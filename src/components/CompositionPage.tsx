import { useMemo, useState } from 'react'
import type {
  CompositionSet,
  Joueuse,
  Match,
  PositionTerrain,
} from '../types'

const ORDRE_TERRAIN: { position: PositionTerrain; ligne: 'front' | 'back' }[] = [
  { position: 'P4', ligne: 'front' },
  { position: 'P3', ligne: 'front' },
  { position: 'P2', ligne: 'front' },
  { position: 'P5', ligne: 'back' },
  { position: 'P6', ligne: 'back' },
  { position: 'P1', ligne: 'back' },
]

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

  const joueuseParId = useMemo(() => {
    const map = new Map<string, Joueuse>()
    joueuses.forEach((j) => map.set(j.id, j))
    return map
  }, [joueuses])

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

      {composition ? (
        <>
          <div className="court">
            {ORDRE_TERRAIN.map(({ position, ligne }) => {
              const affectation = composition.affectations.find(
                (a) => a.position === position,
              )
              const joueuse = affectation
                ? joueuseParId.get(affectation.joueuseId)
                : undefined
              const changement =
                joueuse && affectation && joueuse.posteCle !== affectation.posteJoue

              return (
                <div className={`zone ${ligne}`} key={position}>
                  <span className="pos-label">{position}</span>
                  <div>
                    <div className="joueuse">{joueuse?.nom ?? '—'}</div>
                    <div className={`poste ${changement ? 'changed' : ''}`}>
                      {affectation?.posteJoue ?? ''}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="legend">
            <span className="dot" /> poste joué différent du poste clé de la
            saison
          </p>
        </>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>
          Pas de composition saisie pour ce set.
        </p>
      )}
    </div>
  )
}
