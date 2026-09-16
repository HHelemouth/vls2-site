import type {
  AffectationSet,
  CompositionSet,
  Joueuse,
  PositionTerrain,
} from '../types'
import { POSTES } from '../utils'

const AVANT: PositionTerrain[] = ['P4', 'P3', 'P2']
const ARRIÈRE: PositionTerrain[] = ['P5', 'P6', 'P1']

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

  function zone(position: PositionTerrain) {
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
        <div className="zone zone-editable" key={position}>
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
      <div className="zone" key={position}>
        <span className="pos-label">{position}</span>
        <div>
          <div className="joueuse">{joueuse?.nom ?? '—'}</div>
          <div className={`poste ${changement ? 'changed' : ''}`}>
            {affectation?.posteJoue ?? ''}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="court">
      <div className="court-ligne">
        <span className="court-ligne-label">Ligne avant</span>
        <div className="court-ligne-zones">{AVANT.map(zone)}</div>
      </div>

      <div className="court-filet">
        <span>Filet</span>
      </div>

      <div className="court-ligne">
        <span className="court-ligne-label">Ligne arrière</span>
        <div className="court-ligne-zones">{ARRIÈRE.map(zone)}</div>
      </div>
    </div>
  )
}
