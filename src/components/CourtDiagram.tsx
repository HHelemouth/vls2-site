import type {
  AffectationSet,
  CompositionSet,
  Joueuse,
  PositionTerrain,
} from '../types'
import { POSTES } from '../utils'

const ORDRE_TERRAIN: { position: PositionTerrain; ligne: 'front' | 'back' }[] = [
  { position: 'P4', ligne: 'front' },
  { position: 'P3', ligne: 'front' },
  { position: 'P2', ligne: 'front' },
  { position: 'P5', ligne: 'back' },
  { position: 'P6', ligne: 'back' },
  { position: 'P1', ligne: 'back' },
]

export default function CourtDiagram({
  composition,
  joueuses,
  editable = false,
  onChangeAffectation,
}: {
  composition: CompositionSet | undefined
  joueuses: Joueuse[]
  editable?: boolean
  onChangeAffectation?: (
    position: PositionTerrain,
    champ: 'joueuseId' | 'posteJoue',
    valeur: string,
  ) => void
}) {
  if (!composition && !editable) {
    return (
      <p style={{ color: 'var(--text-muted)' }}>
        Pas de composition saisie pour ce set.
      </p>
    )
  }

  return (
    <div className="court">
      {ORDRE_TERRAIN.map(({ position, ligne }) => {
        const affectation: AffectationSet | undefined = composition
          ? composition.affectations.find((a) => a.position === position)
          : undefined
        const joueuse = affectation
          ? joueuses.find((j) => j.id === affectation.joueuseId)
          : undefined
        const changement =
          joueuse && affectation && joueuse.posteCle !== affectation.posteJoue

        if (editable) {
          return (
            <div className={`zone ${ligne} zone-editable`} key={position}>
              <span className="pos-label">{position}</span>
              <select
                className="zone-select"
                value={affectation?.joueuseId ?? ''}
                onChange={(e) =>
                  onChangeAffectation?.(position, 'joueuseId', e.target.value)
                }
              >
                <option value="">— joueur·se —</option>
                {joueuses.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nom}
                  </option>
                ))}
              </select>
              <select
                className="zone-select"
                value={affectation?.posteJoue ?? 'Passeur'}
                onChange={(e) =>
                  onChangeAffectation?.(position, 'posteJoue', e.target.value)
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
        }

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
  )
}
