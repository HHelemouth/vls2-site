import { useState } from 'react'
import type { Joueuse } from '../types'

export default function TeamPage({ joueuses }: { joueuses: Joueuse[] }) {
  const [licencesVisibles, setLicencesVisibles] = useState(false)
  const triées = [...joueuses].sort((a, b) => a.numero - b.numero)

  return (
    <div>
      <div className="team-toolbar">
        <label className="toggle-licence">
          <input
            type="checkbox"
            checked={licencesVisibles}
            onChange={(e) => setLicencesVisibles(e.target.checked)}
          />
          Afficher les n° de licence
        </label>
      </div>

      <table className="postes-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Joueuse</th>
            <th>Poste(s) de prédilection</th>
            <th>N° de licence</th>
          </tr>
        </thead>
        <tbody>
          {triées.map((j) => (
            <tr key={j.id}>
              <td className="cell-numero">{j.numero}</td>
              <td>{j.nom}</td>
              <td>
                <span className="poste-principal">{j.posteCle}</span>
                {j.autresPostes?.map((p) => (
                  <span className="poste-secondaire" key={p}>
                    {p}
                  </span>
                ))}
              </td>
              <td className="cell-licence">
                {j.numeroLicence
                  ? licencesVisibles
                    ? j.numeroLicence
                    : '••••••••'
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {triées.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>
          Aucune joueuse saisie pour l'instant.
        </p>
      )}
    </div>
  )
}
