import { useState } from 'react'
import ResultsPage from './components/ResultsPage'
import CompositionPage from './components/CompositionPage'
import StatsPage from './components/StatsPage'
import joueusesData from './data/joueuses.json'
import matchesData from './data/matches.json'
import compositionsData from './data/compositions.json'
import type { CompositionSet, Joueuse, Match } from './types'

const joueuses = joueusesData as Joueuse[]
const matches = matchesData as Match[]
const compositions = compositionsData as CompositionSet[]

type Onglet = 'resultats' | 'compositions' | 'stats'

export default function App() {
  const [onglet, setOnglet] = useState<Onglet>('resultats')
  const contientDemo = matches.some((m) => m.demo)

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
          className={onglet === 'resultats' ? 'active' : ''}
          onClick={() => setOnglet('resultats')}
        >
          Résultats
        </button>
        <button
          className={onglet === 'compositions' ? 'active' : ''}
          onClick={() => setOnglet('compositions')}
        >
          Compositions
        </button>
        <button
          className={onglet === 'stats' ? 'active' : ''}
          onClick={() => setOnglet('stats')}
        >
          Stats
        </button>
      </nav>

      {onglet === 'resultats' && <ResultsPage matches={matches} />}
      {onglet === 'compositions' && (
        <CompositionPage
          matches={matches}
          joueuses={joueuses}
          compositions={compositions}
        />
      )}
      {onglet === 'stats' && (
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
