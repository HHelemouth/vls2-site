import { supabase } from './supabaseClient'
import type { CompositionSet, Joueuse, Match } from './types'

// --- Mappers snake_case (Supabase) <-> camelCase (app) ---

function dbToJoueuse(row: any): Joueuse {
  return {
    id: row.id,
    nom: row.nom,
    numero: row.numero,
    posteCle: row.poste_cle,
    autresPostes: row.autres_postes ?? [],
    numeroLicence: row.numero_licence ?? undefined,
  }
}

function joueuseToDb(j: Joueuse) {
  return {
    id: j.id,
    nom: j.nom,
    numero: j.numero,
    poste_cle: j.posteCle,
    autres_postes: j.autresPostes ?? [],
    numero_licence: j.numeroLicence || null,
  }
}

function dbToMatch(row: any): Match {
  return {
    id: row.id,
    date: row.date,
    adversaire: row.adversaire,
    domicile: row.domicile,
    lieu: row.lieu,
    sets: row.sets ?? [],
  }
}

function matchToDb(m: Match) {
  return {
    id: m.id,
    date: m.date,
    adversaire: m.adversaire,
    domicile: m.domicile,
    lieu: m.lieu,
    sets: m.sets,
  }
}

function dbToComposition(row: any): CompositionSet {
  return {
    matchId: row.match_id,
    setNumero: row.set_numero,
    affectations: row.affectations ?? [],
    remplacements: row.remplacements ?? [],
  }
}

function compositionToDb(c: CompositionSet) {
  return {
    match_id: c.matchId,
    set_numero: c.setNumero,
    affectations: c.affectations,
    remplacements: c.remplacements ?? [],
  }
}

// --- Lecture initiale ---

export async function chargerTout() {
  const [joueusesRes, matchesRes, compositionsRes] = await Promise.all([
    supabase.from('joueuses').select('*'),
    supabase.from('matches').select('*'),
    supabase.from('compositions').select('*'),
  ])

  if (joueusesRes.error) throw joueusesRes.error
  if (matchesRes.error) throw matchesRes.error
  if (compositionsRes.error) throw compositionsRes.error

  return {
    joueuses: (joueusesRes.data ?? []).map(dbToJoueuse),
    matches: (matchesRes.data ?? []).map(dbToMatch),
    compositions: (compositionsRes.data ?? []).map(dbToComposition),
  }
}

// --- Écriture ---

export async function sauvegarderJoueuses(
  aGarder: Joueuse[],
  idsASupprimer: string[],
) {
  if (idsASupprimer.length) {
    const { error } = await supabase
      .from('joueuses')
      .delete()
      .in('id', idsASupprimer)
    if (error) throw error
  }
  if (aGarder.length) {
    const { error } = await supabase
      .from('joueuses')
      .upsert(aGarder.map(joueuseToDb))
    if (error) throw error
  }
}

export async function sauvegarderMatch(match: Match) {
  const { error } = await supabase.from('matches').upsert(matchToDb(match))
  if (error) throw error
}

export async function supprimerMatch(id: string) {
  const { error } = await supabase.from('matches').delete().eq('id', id)
  if (error) throw error
}

export async function sauvegarderCompositions(compositions: CompositionSet[]) {
  if (!compositions.length) return
  const { error } = await supabase
    .from('compositions')
    .upsert(compositions.map(compositionToDb))
  if (error) throw error
}

// --- Temps réel : rappelle `onChange` à chaque insert/update/delete ---

export function écouterChangements(onChange: () => void) {
  const canal = supabase
    .channel('vls2-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'joueuses' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'compositions' }, onChange)
    .subscribe()

  return () => {
    supabase.removeChannel(canal)
  }
}
