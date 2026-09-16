import { useState } from 'react'
import type {
  AffectationSet,
  CompositionSet,
  Joueuse,
  Match,
  PositionTerrain,
  SetScore,
} from '../types'
import { POSITIONS, POSTES, affectationsVides, slugify } from '../utils'
import { sauvegarderCompositions, sauvegarderMatch, supprimerMatch } from '../api'

export default function EditMatchPage({
  match,
  compositions,
  joueuses,
  onBack,
  onSaved,
  onDeleted,
}: {
  match?: Match
  compositions: CompositionSet[]
  joueuses: Joueuse[]
  onBack: () => void
  onSaved: (matchId: string) => void
  onDeleted: () => void
}) {
  const [date, setDate] = useState(match?.date ?? '')
  const [adversaire, setAdversaire] = useState(match?.adversaire ?? '')
  const [domicile, setDomicile] = useState(match?.domicile ?? true)
  const [lieu, setLieu] = useState(match?.lieu ?? '')
  const [sets, setSets] = useState<SetScore[]>(
    match?.sets ?? [{ numero: 1, pointsVLS: 0, pointsAdv: 0 }],
  )
  const [compos, setCompos] = useState<Record<number, AffectationSet[]>>(
    () => {
      const initial: Record<number, AffectationSet[]> = {}
      const setsDepart = match?.sets ?? [{ numero: 1, pointsVLS: 0, pointsAdv: 0 }]
      setsDepart.forEach((s) => {
        const existante = compositions.find(
          (c) => c.matchId === match?.id && c.setNumero === s.numero,
        )
        initial[s.numero] = existante
          ? existante.affectations
          : affectationsVides()
      })
      return initial
    },
  )
  const [enregistrement, setEnregistrement] = useState(false)
  const [suppression, setSuppression] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const matchId = match?.id ?? (date && adversaire ? `${date}-${slugify(adversaire)}` : '')

  function ajouterSet() {
    const prochain = (sets[sets.length - 1]?.numero ?? 0) + 1
    setSets([...sets, { numero: prochain, pointsVLS: 0, pointsAdv: 0 }])
    setCompos((c) => ({ ...c, [prochain]: affectationsVides() }))
  }

  function retirerSet(numero: number) {
    setSets(sets.filter((s) => s.numero !== numero))
    setCompos((c) => {
      const copie = { ...c }
      delete copie[numero]
      return copie
    })
  }

  function updateSet(numero: number, champ: 'pointsVLS' | 'pointsAdv', valeur: number) {
    setSets(sets.map((s) => (s.numero === numero ? { ...s, [champ]: valeur } : s)))
  }

  function updateAffectation(
    setNumero: number,
    position: PositionTerrain,
    champ: 'joueuseId' | 'posteJoue',
    valeur: string,
  ) {
    setCompos((c) => ({
      ...c,
      [setNumero]: c[setNumero].map((a) => {
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
    }))
  }

  async function enregistrer() {
    if (!date || !adversaire) {
      setErreur('Renseigne au moins la date et l\'adversaire.')
      return
    }
    setEnregistrement(true)
    setErreur(null)
    try {
      const matchObjet: Match = { id: matchId, date, adversaire, domicile, lieu, sets }
      await sauvegarderMatch(matchObjet)
      await sauvegarderCompositions(
        sets.map((s) => ({
          matchId,
          setNumero: s.numero,
          affectations: compos[s.numero] ?? affectationsVides(),
        })),
      )
      onSaved(matchId)
    } catch (e) {
      setErreur("L'enregistrement a échoué, réessaie.")
    } finally {
      setEnregistrement(false)
    }
  }

  async function supprimer() {
    if (!match) return
    const sûr = window.confirm(
      `Supprimer définitivement le match contre ${match.adversaire} (${match.date}) ? Cette action est irréversible.`,
    )
    if (!sûr) return
    setSuppression(true)
    setErreur(null)
    try {
      await supprimerMatch(match.id)
      onDeleted()
    } catch (e) {
      setErreur('La suppression a échoué, réessaie.')
    } finally {
      setSuppression(false)
    }
  }

  return (
    <div>
      <h2>{match ? 'Modifier le match' : 'Nouveau match'}</h2>

      {erreur && <p className="erreur-inline">{erreur}</p>}

      <div className="edit-section">
        <h3>Infos du match</h3>
        <div className="edit-row">
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="grow">
            Adversaire
            <input
              type="text"
              value={adversaire}
              onChange={(e) => setAdversaire(e.target.value)}
              placeholder="ex: SD Mauves 2"
            />
          </label>
        </div>
        <div className="edit-row">
          <label>
            <input
              type="radio"
              checked={domicile}
              onChange={() => setDomicile(true)}
            />{' '}
            Domicile
          </label>
          <label>
            <input
              type="radio"
              checked={!domicile}
              onChange={() => setDomicile(false)}
            />{' '}
            Extérieur
          </label>
          <label className="grow">
            Lieu
            <input type="text" value={lieu} onChange={(e) => setLieu(e.target.value)} />
          </label>
        </div>

        <h4>Sets</h4>
        {sets.map((s) => (
          <div className="edit-row set-score-row" key={s.numero}>
            <span className="set-num">Set {s.numero}</span>
            <label>
              VLS 2
              <input
                type="number"
                min={0}
                value={s.pointsVLS}
                onFocus={(e) => e.target.select()}
                onChange={(e) => updateSet(s.numero, 'pointsVLS', Number(e.target.value))}
              />
            </label>
            <label>
              Adversaire
              <input
                type="number"
                min={0}
                value={s.pointsAdv}
                onFocus={(e) => e.target.select()}
                onChange={(e) => updateSet(s.numero, 'pointsAdv', Number(e.target.value))}
              />
            </label>
            <button className="btn-remove" onClick={() => retirerSet(s.numero)}>
              Retirer
            </button>
          </div>
        ))}
        <button className="btn-add" onClick={ajouterSet}>
          + Ajouter un set
        </button>
      </div>

      <div className="edit-section">
        <h3>Compositions par set</h3>
        {sets.map((s) => (
          <div className="compo-edit-block" key={s.numero}>
            <h4>Set {s.numero}</h4>
            {POSITIONS.map((position) => {
              const affectation = compos[s.numero]?.find(
                (a) => a.position === position,
              )
              return (
                <div className="edit-row compo-row" key={position}>
                  <span className="pos-tag">{position}</span>
                  <select
                    value={affectation?.joueuseId ?? ''}
                    onChange={(e) =>
                      updateAffectation(s.numero, position, 'joueuseId', e.target.value)
                    }
                  >
                    <option value="">— joueur·se —</option>
                    {joueuses.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.nom} (#{j.numero})
                      </option>
                    ))}
                  </select>
                  <select
                    value={affectation?.posteJoue ?? 'Passeur'}
                    onChange={(e) =>
                      updateAffectation(s.numero, position, 'posteJoue', e.target.value)
                    }
                  >
                    {POSTES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="edit-actions">
        <button className="btn-edit" onClick={enregistrer} disabled={enregistrement}>
          {enregistrement ? 'Enregistrement…' : 'Enregistrer le match'}
        </button>
        <button className="btn-cancel" onClick={onBack} disabled={enregistrement}>
          Annuler
        </button>
        {match && (
          <button
            className="btn-delete"
            onClick={supprimer}
            disabled={suppression}
          >
            {suppression ? 'Suppression…' : 'Supprimer ce match'}
          </button>
        )}
      </div>
    </div>
  )
}
