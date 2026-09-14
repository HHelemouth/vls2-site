import { useEffect, useState } from 'react'
import type { AffectationSet, CompositionSet, Joueuse, Match, PositionTerrain } from '../types'
import CourtDiagram from './CourtDiagram'
import { affectationsVides } from '../utils'

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

  const [enÉdition, setEnÉdition] = useState(false)
  const [brouillon, setBrouillon] = useState<AffectationSet[]>(
    composition?.affectations ?? affectationsVides(),
  )
  const [copié, setCopié] = useState(false)

  // Repart d'une composition propre à chaque changement de match/set.
  useEffect(() => {
    setBrouillon(composition?.affectations ?? affectationsVides())
    setEnÉdition(false)
    setCopié(false)
  }, [matchId, setNumero])

  function modifierAffectation(
    position: PositionTerrain,
    champ: 'joueuseId' | 'posteJoue',
    valeur: string,
  ) {
    setBrouillon((b) =>
      b.map((a) => (a.position === position ? { ...a, [champ]: valeur } : a)),
    )
  }

  function copierJSON() {
    const objet: CompositionSet = {
      matchId,
      setNumero,
      affectations: brouillon,
    }
    navigator.clipboard.writeText(JSON.stringify(objet, null, 2))
    setCopié(true)
    setTimeout(() => setCopié(false), 1800)
  }

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

        <button
          className="btn-edit btn-edit-inline"
          onClick={() => setEnÉdition((v) => !v)}
        >
          {enÉdition ? 'Terminé' : 'Modifier'}
        </button>
      </div>

      {enÉdition ? (
        <>
          <CourtDiagram
            composition={{ matchId, setNumero, affectations: brouillon }}
            joueuses={joueuses}
            editable
            onChangeAffectation={modifierAffectation}
          />
          <p className="legend">Clique sur chaque poste pour choisir la joueuse et son poste joué.</p>
          <div className="json-output">
            <div className="json-output-header">
              <span>JSON à coller dans compositions.json</span>
              <button className="btn-copy" onClick={copierJSON}>
                {copié ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <pre>
              {JSON.stringify({ matchId, setNumero, affectations: brouillon }, null, 2)}
            </pre>
          </div>
        </>
      ) : (
        <>
          <CourtDiagram composition={composition} joueuses={joueuses} />
          {composition && (
            <p className="legend">
              <span className="dot" /> poste joué différent du poste clé de
              la saison
            </p>
          )}
        </>
      )}
    </div>
  )
}
