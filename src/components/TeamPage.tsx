import { useState } from 'react'
import type { Joueuse, Poste } from '../types'
import { POSTES } from '../utils'

function prochainId(joueuses: Joueuse[]) {
  const nums = joueuses
    .map((j) => Number(j.id.replace(/^j/, '')))
    .filter((n) => !Number.isNaN(n))
  return `j${(nums.length ? Math.max(...nums) : 0) + 1}`
}

export default function TeamPage({ joueuses }: { joueuses: Joueuse[] }) {
  const [licencesVisibles, setLicencesVisibles] = useState(false)
  const [enÉdition, setEnÉdition] = useState(false)
  const [brouillon, setBrouillon] = useState<Joueuse[]>(joueuses)
  const [copié, setCopié] = useState(false)

  const affichées = enÉdition ? brouillon : joueuses
  const triées = [...affichées].sort((a, b) => a.numero - b.numero)

  function modifierChamp(
    id: string,
    champ: 'nom' | 'numero' | 'posteCle' | 'numeroLicence',
    valeur: string,
  ) {
    setBrouillon((b) =>
      b.map((j) =>
        j.id === id
          ? { ...j, [champ]: champ === 'numero' ? Number(valeur) : valeur }
          : j,
      ),
    )
  }

  function basculerAutrePoste(id: string, poste: Poste) {
    setBrouillon((b) =>
      b.map((j) => {
        if (j.id !== id) return j
        const actuels = j.autresPostes ?? []
        const présent = actuels.includes(poste)
        return {
          ...j,
          autresPostes: présent
            ? actuels.filter((p) => p !== poste)
            : [...actuels, poste],
        }
      }),
    )
  }

  function ajouterJoueuse() {
    const nouvelle: Joueuse = {
      id: prochainId(brouillon),
      nom: '',
      numero: 0,
      posteCle: 'Passeur',
    }
    setBrouillon((b) => [...b, nouvelle])
  }

  function retirerJoueuse(id: string) {
    setBrouillon((b) => b.filter((j) => j.id !== id))
  }

  function copierJSON() {
    navigator.clipboard.writeText(JSON.stringify(brouillon, null, 2))
    setCopié(true)
    setTimeout(() => setCopié(false), 1800)
  }

  return (
    <div>
      <div className="team-toolbar">
        {!enÉdition && (
          <label className="toggle-licence">
            <input
              type="checkbox"
              checked={licencesVisibles}
              onChange={(e) => setLicencesVisibles(e.target.checked)}
            />
            Afficher les n° de licence
          </label>
        )}
        <button
          className="btn-edit btn-edit-inline"
          onClick={() => {
            if (!enÉdition) setBrouillon(joueuses)
            setEnÉdition((v) => !v)
          }}
        >
          {enÉdition ? 'Terminé' : 'Modifier'}
        </button>
      </div>

      {enÉdition ? (
        <>
          {triées.map((j) => (
            <div className="joueuse-edit-card" key={j.id}>
              <div className="edit-row">
                <label>
                  N°
                  <input
                    type="number"
                    min={0}
                    value={j.numero}
                    onChange={(e) => modifierChamp(j.id, 'numero', e.target.value)}
                  />
                </label>
                <label className="grow">
                  Nom
                  <input
                    type="text"
                    value={j.nom}
                    onChange={(e) => modifierChamp(j.id, 'nom', e.target.value)}
                  />
                </label>
                <label>
                  Poste principal
                  <select
                    value={j.posteCle}
                    onChange={(e) => modifierChamp(j.id, 'posteCle', e.target.value)}
                  >
                    {POSTES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grow">
                  N° de licence
                  <input
                    type="text"
                    value={j.numeroLicence ?? ''}
                    onChange={(e) =>
                      modifierChamp(j.id, 'numeroLicence', e.target.value)
                    }
                  />
                </label>
                <button className="btn-remove" onClick={() => retirerJoueuse(j.id)}>
                  Retirer
                </button>
              </div>
              <div className="postes-secondaires-edit">
                <span className="label-inline">Aussi à l'aise en :</span>
                {POSTES.filter((p) => p !== j.posteCle).map((p) => (
                  <label className="checkbox-inline" key={p}>
                    <input
                      type="checkbox"
                      checked={(j.autresPostes ?? []).includes(p)}
                      onChange={() => basculerAutrePoste(j.id, p)}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button className="btn-add" onClick={ajouterJoueuse}>
            + Ajouter une joueuse
          </button>

          <div className="json-output">
            <div className="json-output-header">
              <span>JSON à coller dans joueuses.json (remplace tout le fichier)</span>
              <button className="btn-copy" onClick={copierJSON}>
                {copié ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <pre>{JSON.stringify(brouillon, null, 2)}</pre>
          </div>
        </>
      ) : (
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
      )}

      {triées.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>
          Aucune joueuse saisie pour l'instant.
        </p>
      )}
    </div>
  )
}
