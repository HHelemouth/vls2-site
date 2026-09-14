import type { AffectationSet, Poste, PositionTerrain } from './types'

export const POSTES: Poste[] = [
  'Passeur',
  'Pointu',
  'Central',
  'Réceptionneur-Attaquant',
  'Libero',
]

export const POSITIONS: PositionTerrain[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']

export function affectationsVides(): AffectationSet[] {
  return POSITIONS.map((position) => ({
    position,
    joueuseId: '',
    posteJoue: 'Passeur' as Poste,
  }))
}

export function slugify(texte: string) {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
