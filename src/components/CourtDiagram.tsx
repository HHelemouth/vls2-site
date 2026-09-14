import type { CompositionSet, Joueuse, PositionTerrain } from '../types'

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
}: {
  composition: CompositionSet | undefined
  joueuses: Joueuse[]
}) {
  if (!composition) {
    return (
      <p style={{ color: 'var(--text-muted)' }}>
        Pas de composition saisie pour ce set.
      </p>
    )
  }

  return (
    <div className="court">
      {ORDRE_TERRAIN.map(({ position, ligne }) => {
        const affectation = composition.affectations.find(
          (a) => a.position === position,
        )
        const joueuse = affectation
          ? joueuses.find((j) => j.id === affectation.joueuseId)
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
  )
}
