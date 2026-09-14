// Postes tels que nommés dans l'équipe. Adapter la liste si le vocabulaire
// du club diffère (ex: "Central" vs "Contre").
export type Poste =
  | 'Passeur'
  | 'Pointu'
  | 'Central'
  | 'Réceptionneur-Attaquant'
  | 'Libero'

export interface Joueuse {
  id: string
  nom: string
  numero: number
  posteCle: Poste // poste principal attribué pour la saison
  autresPostes?: Poste[] // autres postes de prédilection, s'il y en a
  numeroLicence?: string // n° de licence FFvolley, optionnel
}

export interface SetScore {
  numero: number // 1 à 5
  pointsVLS: number
  pointsAdv: number
}

export interface Match {
  id: string
  date: string // ISO yyyy-mm-dd
  adversaire: string
  domicile: boolean
  lieu: string
  sets: SetScore[]
  demo?: boolean // true pour les données d'exemple, à retirer une fois les vrais matchs saisis
}

// Position sur le terrain façon rotation volley : P1 à P6.
// P1/P6/P5 = ligne arrière, P4/P3/P2 = ligne avant (P2 côté passe).
export type PositionTerrain = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6'

export interface AffectationSet {
  position: PositionTerrain
  joueuseId: string
  posteJoue: Poste // peut différer du posteCle de la joueuse
}

export interface CompositionSet {
  matchId: string
  setNumero: number
  affectations: AffectationSet[]
}
