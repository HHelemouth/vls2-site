import { useState } from 'react'
import type { Joueuse, Poste } from '../types'
import { POSTES } from '../utils'
import { sauvegarderJoueuses } from '../api'

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
  const [idsSupprimés, setIdsSupprimés] = useState<string[]>([])
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

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
    if (joueuses.some((j) => j.id === id)) {
      setIdsSupprimés((s) => [...s, id])
    }
  }

  async function enregistrer() {
    setEnregistrement(true)
    setErreur(null)
    try {
      await sauvegarderJoueuses(brouillon, idsSupprimés)
      setIdsSupprimés([])
      setEnÉdition(false)
    } catch (e) {
      const détail = e instanceof Error ? e.message : String(e)
      setErreur(`L'enregistrement a échoué : ${détail}`)
    } finally {
      setEnregistrement(false)
    }
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
        {!enÉdition && (
          <button
            className="btn-edit btn-edit-inline"
            onClick={() => {
              setBrouillon(joueuses)
              setIdsSupprimés([])
              setEnÉdition(true)
            }}
          >
            Modifier
          </button>
        )}
        {enÉdition && (
          <div className="edit-actions">
            <button
              className="btn-edit btn-edit-inline"
              onClick={enregistrer}
              disabled={enregistrement}
            >
              {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button
              className="btn-cancel"
              onClick={() => setEnÉdition(false)}
              disabled={enregistrement}
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      {erreur && <p className="erreur-inline">{erreur}</p>}

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
                    onFocus={(e) => e.target.select()}
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

          <div className="edit-row">
            <button className="btn-add" onClick={ajouterJoueuse}>
              + Ajouter un·e joueur·se
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="table-scroll roster-table">
            <table className="postes-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Joueur·se</th>
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
          </div>

          <div className="roster-cards">
            {triées.map((j) => (
              <div className="roster-card" key={j.id}>
                <div className="roster-card-top">
                  <span className="roster-card-nom">{j.nom}</span>
                  <span className="roster-card-numero">#{j.numero}</span>
                </div>
                <div className="roster-card-postes">
                  <span className="poste-pill principal">{j.posteCle}</span>
                  {j.autresPostes?.map((p) => (
                    <span className="poste-pill" key={p}>
                      {p}
                    </span>
                  ))}
                </div>
                {j.numeroLicence && (
                  <div className="roster-card-licence">
                    Licence : {licencesVisibles ? j.numeroLicence : '••••••••'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {triées.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>
          Aucun·e joueur·se saisi·e pour l'instant.
        </p>
      )}
    </div>
  )
}
