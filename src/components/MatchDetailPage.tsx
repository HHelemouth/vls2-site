import { useState } from 'react'
import type {
  AffectationSet,
  CompositionSet,
  Joueuse,
  Match,
  PositionTerrain,
  Remplacement,
} from '../types'
import CourtDiagram from './CourtDiagram'
import { affectationsVides, POSITIONS } from '../utils'
import { sauvegarderCompositions, sauvegarderMatch, supprimerMatch } from '../api'

function setGagné(pointsVLS: number, pointsAdv: number) {
  return pointsVLS > pointsAdv
}

function nomJoueuse(id: string, joueuses: Joueuse[]) {
  return joueuses.find((j) => j.id === id)?.nom ?? '?'
}

function RemplacementsEditeur({
  remplacements,
  joueuses,
  onChange,
}: {
  remplacements: Remplacement[]
  joueuses: Joueuse[]
  onChange: (remplacements: Remplacement[]) => void
}) {
  function ajouter() {
    onChange([
      ...remplacements,
      {
        position: 'P1',
        joueuseSortante: '',
        joueuseEntrante: '',
        scoreVLS: 0,
        scoreAdv: 0,
      },
    ])
  }

  function retirer(index: number) {
    onChange(remplacements.filter((_, i) => i !== index))
  }

  function modifier(index: number, champ: keyof Remplacement, valeur: string | number) {
    onChange(
      remplacements.map((r, i) => (i === index ? { ...r, [champ]: valeur } : r)),
    )
  }

  return (
    <div className="remplacements-edit">
      {remplacements.map((r, i) => (
        <div className="remplacement-row" key={i}>
          <div className="edit-row">
            <label>
              Position
              <select
                value={r.position}
                onChange={(e) => modifier(i, 'position', e.target.value)}
              >
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="grow">
              Sortante
              <select
                value={r.joueuseSortante}
                onChange={(e) => modifier(i, 'joueuseSortante', e.target.value)}
              >
                <option value="">— joueur·se —</option>
                {joueuses.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nom}
                  </option>
                ))}
              </select>
            </label>
            <label className="grow">
              Entrante
              <select
                value={r.joueuseEntrante}
                onChange={(e) => modifier(i, 'joueuseEntrante', e.target.value)}
              >
                <option value="">— joueur·se —</option>
                {joueuses.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nom}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="edit-row">
            <label>
              Score VLS 2 à ce moment
              <input
                type="number"
                min={0}
                value={r.scoreVLS}
                onFocus={(e) => e.target.select()}
                onChange={(e) => modifier(i, 'scoreVLS', Number(e.target.value))}
              />
            </label>
            <label>
              Score adversaire à ce moment
              <input
                type="number"
                min={0}
                value={r.scoreAdv}
                onFocus={(e) => e.target.select()}
                onChange={(e) => modifier(i, 'scoreAdv', Number(e.target.value))}
              />
            </label>
            <button className="btn-remove" onClick={() => retirer(i)}>
              Retirer
            </button>
          </div>
        </div>
      ))}
      <button className="btn-add" onClick={ajouter}>
        + Ajouter un remplacement
      </button>
    </div>
  )
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
  const [remplacementsBrouillon, setRemplacementsBrouillon] = useState<Remplacement[]>(
    composition?.remplacements ?? [],
  )
  const [scoreVLS, setScoreVLS] = useState(pointsVLS)
  const [scoreAdv, setScoreAdv] = useState(pointsAdv)
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  function modifierAffectation(
    position: PositionTerrain,
    champ: 'joueuseId' | 'posteJoue',
    valeur: string,
  ) {
    setBrouillon((b) =>
      b.map((a) => {
        if (a.position !== position) return a
        if (champ === 'joueuseId') {
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

  function entrerÉdition() {
    setBrouillon(composition?.affectations ?? affectationsVides())
    setRemplacementsBrouillon(composition?.remplacements ?? [])
    setScoreVLS(pointsVLS)
    setScoreAdv(pointsAdv)
    setEnÉdition(true)
  }

  async function enregistrer() {
    setEnregistrement(true)
    setErreur(null)
    try {
      const sets = match.sets.map((s) =>
        s.numero === setNumero
          ? { ...s, pointsVLS: scoreVLS, pointsAdv: scoreAdv }
          : s,
      )
      await sauvegarderMatch({ ...match, sets })
      await sauvegarderCompositions([
        {
          matchId: match.id,
          setNumero,
          affectations: brouillon,
          remplacements: remplacementsBrouillon.filter(
            (r) => r.joueuseSortante && r.joueuseEntrante,
          ),
        },
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
        <button
          className="btn-edit btn-edit-inline btn-edit-right"
          onClick={() => (enÉdition ? setEnÉdition(false) : entrerÉdition())}
        >
          {enÉdition ? 'Annuler' : 'Modifier'}
        </button>
      </div>

      {erreur && <p className="erreur-inline">{erreur}</p>}

      {enÉdition ? (
        <>
          <div className="edit-row score-edit-row">
            <label>
              Score final VLS 2
              <input
                type="number"
                min={0}
                value={scoreVLS}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setScoreVLS(Number(e.target.value))}
              />
            </label>
            <label>
              Score final adversaire
              <input
                type="number"
                min={0}
                value={scoreAdv}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setScoreAdv(Number(e.target.value))}
              />
            </label>
          </div>

          <h4 className="lignes-titre">Composition de départ (feuille de match)</h4>
          <CourtDiagram
            composition={{ matchId: match.id, setNumero, affectations: brouillon }}
            joueuses={joueuses}
            editable
            onChangeAffectation={modifierAffectation}
          />

          <h4 className="lignes-titre">Remplacements en cours de set</h4>
          <RemplacementsEditeur
            remplacements={remplacementsBrouillon}
            joueuses={joueuses}
            onChange={setRemplacementsBrouillon}
          />

          <button className="btn-edit" onClick={enregistrer} disabled={enregistrement}>
            {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </>
      ) : (
        <>
          <p className="composition-titre">Composition de départ</p>
          <CourtDiagram composition={composition} joueuses={joueuses} />
          {composition?.remplacements && composition.remplacements.length > 0 && (
            <div className="remplacements-affichage">
              {composition.remplacements.map((r, i) => (
                <div className="remplacement-pill" key={i}>
                  À {r.scoreVLS}–{r.scoreAdv} ({r.position}) :{' '}
                  {nomJoueuse(r.joueuseSortante, joueuses)} →{' '}
                  {nomJoueuse(r.joueuseEntrante, joueuses)}
                </div>
              ))}
            </div>
          )}
        </>
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
          Modifier les infos du match ou gérer les sets
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
