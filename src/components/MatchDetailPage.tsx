import { useState } from 'react'
import type { AffectationSet, CompositionSet, Joueuse, Match, PositionTerrain } from '../types'
import CourtDiagram from './CourtDiagram'
import { affectationsVides } from '../utils'
import { sauvegarderCompositions, supprimerMatch } from '../api'

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
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

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
      b.map((a) => {
        if (a.position !== position) return a
        if (champ === 'joueuseId') {
          // Pré-remplit avec le poste clé de la saison, modifiable ensuite.
          const joueuse = joueuses.find((j) => j.id === valeur)
          return {
            ...a,
            joueuseId: valeur,
            posteJoue: joueuse?.posteCle ?? a.posteJoue,
          }
        }
        return { ...a, posteJoue: valeur as AffectationSet['posteJoue'] }
      }),
    )
  }

  async function enregistrer() {
    setEnregistrement(true)
    setErreur(null)
    try {
      await sauvegarderCompositions([
        { matchId: match.id, setNumero, affectations: brouillon },
      ])
      setEnÉdition(false)
    } catch (e) {
      setErreur("L'enregistrement a échoué, réessaie.")
    } finally {
      setEnregistrement(false)
    }
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
          {enÉdition ? 'Annuler' : 'Modifier'}
        </button>
      </div>

      {erreur && <p className="erreur-inline">{erreur}</p>}

      {enÉdition ? (
        <>
          <CourtDiagram
            composition={{ matchId: match.id, setNumero, affectations: brouillon }}
            joueuses={joueuses}
            editable
            onChangeAffectation={modifierAffectation}
          />
          <button className="btn-edit" onClick={enregistrer} disabled={enregistrement}>
            {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
          </button>
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
  onDeleted,
}: {
  match: Match
  joueuses: Joueuse[]
  compositions: CompositionSet[]
  onBack: () => void
  onEdit: () => void
  onDeleted: () => void
}) {
  const joué = match.sets.length > 0
  const setsGagnés = match.sets.filter((s) =>
    setGagné(s.pointsVLS, s.pointsAdv),
  ).length
  const gagné = joué && setsGagnés > match.sets.length - setsGagnés
  const [suppression, setSuppression] = useState(false)
  const [erreurSuppression, setErreurSuppression] = useState<string | null>(null)

  async function supprimer() {
    const sûr = window.confirm(
      `Supprimer définitivement le match contre ${match.adversaire} (${match.date}) ? Cette action est irréversible.`,
    )
    if (!sûr) return
    setSuppression(true)
    setErreurSuppression(null)
    try {
      await supprimerMatch(match.id)
      onDeleted()
    } catch (e) {
      setErreurSuppression('La suppression a échoué, réessaie.')
    } finally {
      setSuppression(false)
    }
  }

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
        <div className={`issue issue-large ${joué ? (gagné ? 'win' : 'loss') : 'a-venir'}`}>
          {joué ? (gagné ? 'Victoire' : 'Défaite') : 'À venir'}
        </div>
      </div>

      <div className="edit-actions">
        <button className="btn-edit" onClick={onEdit}>
          Modifier le score ou ajouter/retirer un set
        </button>
        <button className="btn-delete" onClick={supprimer} disabled={suppression}>
          {suppression ? 'Suppression…' : 'Supprimer ce match'}
        </button>
      </div>

      {erreurSuppression && <p className="erreur-inline">{erreurSuppression}</p>}

      {!joué && (
        <p style={{ color: 'var(--text-muted)' }}>
          Match pas encore joué — les sets et la composition n'ont pas
          encore été saisis.
        </p>
      )}

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
