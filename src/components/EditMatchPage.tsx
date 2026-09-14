import { useState } from 'react'
import type {
  AffectationSet,
  CompositionSet,
  Joueuse,
  Match,
  Poste,
  PositionTerrain,
  SetScore,
} from '../types'

const POSTES: Poste[] = [
  'Passeur',
  'Pointu',
  'Central',
  'Réceptionneur-Attaquant',
  'Libero',
]

const POSITIONS: PositionTerrain[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']

function slugify(texte: string) {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function affectationsVides(): AffectationSet[] {
  return POSITIONS.map((position) => ({
    position,
    joueuseId: '',
    posteJoue: 'Passeur' as Poste,
  }))
}

export default function EditMatchPage({
  match,
  compositions,
  joueuses,
  onBack,
}: {
  match?: Match
  compositions: CompositionSet[]
  joueuses: Joueuse[]
  onBack: () => void
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
      const setsDepart = match?.sets ?? [{ numero: 1 }]
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
  const [copié, setCopié] = useState<'match' | 'compos' | null>(null)

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
      [setNumero]: c[setNumero].map((a) =>
        a.position === position ? { ...a, [champ]: valeur } : a,
      ),
    }))
  }

  const matchObjet: Match = {
    id: matchId,
    date,
    adversaire,
    domicile,
    lieu,
    sets,
  }

  const compositionsObjet: CompositionSet[] = sets.map((s) => ({
    matchId,
    setNumero: s.numero,
    affectations: compos[s.numero] ?? affectationsVides(),
  }))

  function copier(quoi: 'match' | 'compos') {
    const texte =
      quoi === 'match'
        ? JSON.stringify(matchObjet, null, 2)
        : JSON.stringify(compositionsObjet, null, 2)
    navigator.clipboard.writeText(texte)
    setCopié(quoi)
    setTimeout(() => setCopié(null), 1800)
  }

  return (
    <div>
      <button className="lien-retour" onClick={onBack}>
        ← Retour
      </button>
      <h2>{match ? 'Modifier le match' : 'Nouveau match'}</h2>

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
                onChange={(e) => updateSet(s.numero, 'pointsVLS', Number(e.target.value))}
              />
            </label>
            <label>
              Adversaire
              <input
                type="number"
                min={0}
                value={s.pointsAdv}
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

        <div className="json-output">
          <div className="json-output-header">
            <span>JSON à coller dans matches.json</span>
            <button className="btn-copy" onClick={() => copier('match')}>
              {copié === 'match' ? 'Copié !' : 'Copier'}
            </button>
          </div>
          <pre>{JSON.stringify(matchObjet, null, 2)}</pre>
        </div>
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
                    <option value="">— joueuse —</option>
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

        <div className="json-output">
          <div className="json-output-header">
            <span>JSON à coller dans compositions.json</span>
            <button className="btn-copy" onClick={() => copier('compos')}>
              {copié === 'compos' ? 'Copié !' : 'Copier'}
            </button>
          </div>
          <pre>{JSON.stringify(compositionsObjet, null, 2)}</pre>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Copie les deux blocs JSON et remplace/ajoute l'entrée correspondante
        dans <code>src/data/matches.json</code> et{' '}
        <code>src/data/compositions.json</code>, puis commit + push. Le site
        se redéploie automatiquement.
      </p>
    </div>
  )
}
