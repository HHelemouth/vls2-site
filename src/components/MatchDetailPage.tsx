import { useState } from 'react'
import type { AffectationSet, CompositionSet, Joueuse, Match, PositionTerrain } from '../types'
import CourtDiagram from './CourtDiagram'
import { affectationsVides } from '../utils'

function setGagné(pointsVLS: number, pointsAdv: number) {
  return pointsVLS > pointsAdv
}

function SetBlock({
  match,
  setNumero,
  pointsVLS,
  pointsAdv,
  composition,
  joueuses,
}: {
  match: Match
  setNumero: number
  pointsVLS: number
  pointsAdv: number
  composition: CompositionSet | undefined
  joueuses: Joueuse[]
}) {
  const [enÉdition, setEnÉdition] = useState(false)
  const [brouillon, setBrouillon] = useState<AffectationSet[]>(
    composition?.affectations ?? affectationsVides(),
  )
  const [copié, setCopié] = useState(false)

  const changements = (enÉdition ? brouillon : composition?.affectations ?? []).filter(
    (a) => {
      const j = joueuses.find((j) => j.id === a.joueuseId)
      return j && j.posteCle !== a.posteJoue
    },
  ).length

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
      matchId: match.id,
      setNumero,
      affectations: brouillon,
    }
    navigator.clipboard.writeText(JSON.stringify(objet, null, 2))
    setCopié(true)
    setTimeout(() => setCopié(false), 1800)
  }

  return (
    <div className="set-block">
      <div className="set-block-header">
        <h3>Set {setNumero}</h3>
        <span className={`set-pill ${setGagné(pointsVLS, pointsAdv) ? 'win' : 'loss'}`}>
          {pointsVLS}–{pointsAdv}
        </span>
        {changements > 0 && (
          <span className="changement-tag">
            {changements} changement{changements > 1 ? 's' : ''} de poste
          </span>
        )}
        <button
          className="btn-edit btn-edit-inline btn-edit-right"
          onClick={() => {
            if (!enÉdition) setBrouillon(composition?.affectations ?? affectationsVides())
            setEnÉdition((v) => !v)
          }}
        >
          {enÉdition ? 'Terminé' : 'Modifier'}
        </button>
      </div>

      {enÉdition ? (
        <>
          <CourtDiagram
            composition={{ matchId: match.id, setNumero, affectations: brouillon }}
            joueuses={joueuses}
            editable
            onChangeAffectation={modifierAffectation}
          />
          <div className="json-output">
            <div className="json-output-header">
              <span>JSON à coller dans compositions.json</span>
              <button className="btn-copy" onClick={copierJSON}>
                {copié ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <pre>
              {JSON.stringify(
                { matchId: match.id, setNumero, affectations: brouillon },
                null,
                2,
              )}
            </pre>
          </div>
        </>
      ) : (
        <CourtDiagram composition={composition} joueuses={joueuses} />
      )}
    </div>
  )
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
        Modifier le score ou ajouter/retirer un set
      </button>

      {match.sets.map((set) => (
        <SetBlock
          key={set.numero}
          match={match}
          setNumero={set.numero}
          pointsVLS={set.pointsVLS}
          pointsAdv={set.pointsAdv}
          composition={compositions.find(
            (c) => c.matchId === match.id && c.setNumero === set.numero,
          )}
          joueuses={joueuses}
        />
      ))}

      <p className="legend">
        <span className="dot" /> poste joué différent du poste clé de la
        saison
      </p>
    </div>
  )
}
