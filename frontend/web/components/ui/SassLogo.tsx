import React from 'react'
import Image from 'next/image'
import styles from './SassLogo.module.scss'

interface SassLogoProps {
  size?: number
  className?: string
  showText?: boolean
  animated?: boolean
  simple?: boolean // Pour une version simplifiée sans styles SASS du conteneur
}

/**
 * Logo SASS pour Viridial
 * 
 * @param size - Taille du logo en pixels (défaut: 48)
 * @param className - Classes CSS additionnelles
 * @param showText - Afficher le texte "SASS" à côté du logo
 * @param animated - Ajouter une animation pulse au logo
 */
export function SassLogo({ 
  size = 48, 
  className = '',
  showText = false,
  animated = false,
  simple = false
}: SassLogoProps) {
  // Version simplifiée pour intégration dans le header (sans styles SASS du conteneur)
  if (simple) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div className={`transition-transform ${animated ? styles.animated : ''}`}>
          <Image
            src="/sass-logo.svg"
            alt="SASS Logo"
            width={size}
            height={size}
            className="flex-shrink-0"
            priority
          />
        </div>
        {showText && (
          <span className={`ml-2 font-semibold text-lg tracking-wide ${styles.gradientText}`}>
            SASS
          </span>
        )}
      </div>
    )
  }

  // Version complète avec styles SASS
  return (
    <div className={`${styles.logoContainer} ${className}`}>
      <div className={`${styles.logo} ${animated ? styles.animated : ''}`}>
        <Image
          src="/sass-logo.svg"
          alt="SASS Logo"
          width={size}
          height={size}
          className="flex-shrink-0"
          priority
        />
      </div>
      {showText && (
        <span className={`${styles.text} ${styles.gradientText}`}>
          SASS
        </span>
      )}
    </div>
  )
}

/**
 * Variante du logo SASS avec badge de version ou statut
 */
export function SassLogoBadge({ 
  size = 48,
  variant = 'default'
}: { 
  size?: number
  variant?: 'default' | 'active' | 'installed'
}) {
  const badgeLabels = {
    default: 'SASS',
    active: 'ACTIVE',
    installed: 'INSTALLED'
  }

  return (
    <div className={styles.badge}>
      <SassLogo size={size} />
      <span className={`${styles.badgeLabel} ${styles[variant]}`}>
        {badgeLabels[variant]}
      </span>
    </div>
  )
}

