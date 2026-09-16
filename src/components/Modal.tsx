import { useEffect } from 'react'
import type { ReactNode } from 'react'

export default function Modal({
  children,
  onClose,
}: {
  children: ReactNode
  onClose: () => void
}) {
  useEffect(() => {
    function surTouche(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', surTouche)
    return () => document.removeEventListener('keydown', surTouche)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
