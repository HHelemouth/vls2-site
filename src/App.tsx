import { useState } from 'react'
import ResultsPage from './components/ResultsPage'
import TeamPage from './components/TeamPage'
import StatsPage from './components/StatsPage'
import MatchDetailPage from './components/MatchDetailPage'
import EditMatchPage from './components/EditMatchPage'
import joueusesData from './data/joueuses.json'
import matchesData from './data/matches.json'
import compositionsData from './data/compositions.json'
import type { CompositionSet, Joueuse, Match } from './types'

const joueuses = joueusesData as Joueuse[]
const matches = matchesData as Match[]
const compositions = compositionsData as CompositionSet[]

type Onglet = 'resultats' | 'equipe' | 'stats'
type Vue =
  | { type: 'liste' }
  | { type: 'match'; matchId: string }
  | { type: 'edition'; matchId?: string }

export default function App() {
  const [onglet, setOnglet] = useState<Onglet>('resultats')
  const [vue, setVue] = useState<Vue>({ type: 'liste' })
  const contientDemo = matches.some((m) => m.demo)

  function allerAuxOnglets(nom: Onglet) {
    setOnglet(nom)
    setVue({ type: 'liste' })
  }

  const matchSélectionné =
    vue.type === 'match' ? matches.find((m) => m.id === vue.matchId) : undefined
  const matchEnÉdition =
    vue.type === 'edition' && vue.matchId
      ? matches.find((m) => m.id === vue.matchId)
      : undefined

  return (
    <div className="shell">
      <header className="masthead">
        <h1>VLS 2</h1>
        <span className="saison">Saison 2026/2027 — Poule CE2</span>
      </header>

      {contientDemo && (
        <div className="demo-banner">
          <strong>Données de démonstration.</strong> Les matchs et
          compositions affichés ici sont fictifs, le temps de remplacer les
          fichiers dans <code>src/data/</code> par les vrais résultats.
        </div>
      )}

      <nav className="tabs">
        <button
          className={onglet === 'resultats' && vue.type === 'liste' ? 'active' : ''}
          onClick={() => allerAuxOnglets('resultats')}
        >
          Résultats
        </button>
        <button
          className={onglet === 'equipe' && vue.type === 'liste' ? 'active' : ''}
          onClick={() => allerAuxOnglets('equipe')}
        >
          Équipe
        </button>
        <button
          className={onglet === 'stats' && vue.type === 'liste' ? 'active' : ''}
          onClick={() => allerAuxOnglets('stats')}
        >
          Stats
        </button>
        <button
          className={vue.type === 'edition' && !vue.matchId ? 'active' : ''}
          onClick={() => setVue({ type: 'edition' })}
        >
          + Nouveau match
        </button>
      </nav>

      {vue.type === 'match' && matchSélectionné && (
        <MatchDetailPage
          match={matchSélectionné}
          joueuses={joueuses}
          compositions={compositions}
          onBack={() => setVue({ type: 'liste' })}
          onEdit={() => setVue({ type: 'edition', matchId: matchSélectionné.id })}
        />
      )}

      {vue.type === 'edition' && (
        <EditMatchPage
          match={matchEnÉdition}
          compositions={compositions}
          joueuses={joueuses}
          onBack={() =>
            setVue(
              matchEnÉdition
                ? { type: 'match', matchId: matchEnÉdition.id }
                : { type: 'liste' },
            )
          }
        />
      )}

      {vue.type === 'liste' && onglet === 'resultats' && (
        <ResultsPage
          matches={matches}
          onSelect={(matchId) => setVue({ type: 'match', matchId })}
        />
      )}
      {vue.type === 'liste' && onglet === 'equipe' && (
        <TeamPage joueuses={joueuses} />
      )}
      {vue.type === 'liste' && onglet === 'stats' && (
        <StatsPage
          matches={matches}
          joueuses={joueuses}
          compositions={compositions}
        />
      )}

      <footer className="note">
        Photos et vidéos de matchs ou d'entraînements : envoie-les
        directement à Claude en précisant le match ou la séance concernée,
        pour l'instant ce n'est pas encore intégré au site.
      </footer>
    </div>
  )
}
