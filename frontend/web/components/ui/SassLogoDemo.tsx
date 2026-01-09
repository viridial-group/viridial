import React from 'react'
import { SassLogo, SassLogoBadge } from './SassLogo'
import styles from './SassLogo.module.scss'

/**
 * Composant de démonstration pour le logo SASS
 * Montre les différentes variantes et utilisations
 */
export function SassLogoDemo() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 rounded-lg">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">SASS Logo - Démonstration</h2>
        <p className="text-gray-600 mb-6">
          Différentes variantes et utilisations du logo SASS dans Viridial
        </p>
      </div>

      {/* Logo simple */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Logo Simple</h3>
        <div className="flex items-center gap-6 flex-wrap">
          <SassLogo size={32} />
          <SassLogo size={48} />
          <SassLogo size={64} />
          <SassLogo size={96} />
        </div>
      </section>

      {/* Logo avec texte */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Logo avec Texte</h3>
        <div className="flex items-center gap-6 flex-wrap">
          <SassLogo size={32} showText />
          <SassLogo size={48} showText />
          <SassLogo size={64} showText />
        </div>
      </section>

      {/* Logo animé */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Logo Animé</h3>
        <div className="flex items-center gap-6 flex-wrap">
          <SassLogo size={48} animated />
          <SassLogo size={64} showText animated />
        </div>
      </section>

      {/* Logo avec badge */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Logo avec Badge</h3>
        <div className="flex items-center gap-6 flex-wrap">
          <SassLogoBadge size={48} variant="default" />
          <SassLogoBadge size={48} variant="active" />
          <SassLogoBadge size={48} variant="installed" />
        </div>
      </section>

      {/* Utilisation dans des cartes */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Dans une Carte</h3>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <SassLogo size={64} showText />
            </div>
            <SassLogoBadge variant="installed" />
          </div>
          <p className="text-gray-600">
            SASS est maintenant configuré dans le projet Viridial. 
            Vous pouvez utiliser les fichiers .scss et .sass directement dans Next.js.
          </p>
        </div>
      </section>

      {/* Code d'exemple */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Exemple d'utilisation</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { SassLogo } from '@/components/ui/SassLogo'

// Logo simple
<SassLogo size={48} />

// Logo avec texte
<SassLogo size={48} showText />

// Logo animé
<SassLogo size={48} animated />

// Logo avec badge
<SassLogoBadge variant="installed" />`}
        </pre>
      </section>
    </div>
  )
}

