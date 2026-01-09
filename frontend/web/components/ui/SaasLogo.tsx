import React from 'react'
import Image from 'next/image'
import styles from './SaasLogo.module.scss'

interface SaasLogoProps {
  size?: number
  className?: string
  showText?: boolean
  animated?: boolean
  simple?: boolean // Pour une version simplifiée sans styles SASS du conteneur
}

/**
 * Logo SaaS (Software as a Service) pour Viridial
 * 
 * @param size - Taille du logo en pixels (défaut: 48)
 * @param className - Classes CSS additionnelles
 * @param showText - Afficher le texte "SaaS" à côté du logo
 * @param animated - Ajouter une animation pulse au logo
 * @param simple - Version simplifiée sans styles SASS du conteneur
 */
export function SaasLogo({ 
  size = 48, 
  className = '',
  showText = false,
  animated = false,
  simple = false
}: SaasLogoProps) {
  // Version simplifiée pour intégration dans le header (sans styles SASS du conteneur)
  if (simple) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div className={`transition-transform ${animated ? styles.animated : ''}`}>
          <Image
            src="/saas-logo.svg"
            alt="SaaS Logo - Software as a Service"
            width={size}
            height={size}
            className="flex-shrink-0"
            priority
          />
        </div>
        {showText && (
          <span className={`ml-2 font-semibold text-lg tracking-wide ${styles.gradientText}`}>
            SaaS
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
          src="/saas-logo.svg"
          alt="SaaS Logo - Software as a Service"
          width={size}
          height={size}
          className="flex-shrink-0"
          priority
        />
      </div>
      {showText && (
        <span className={`${styles.text} ${styles.gradientText}`}>
          SaaS
        </span>
      )}
    </div>
  )
}

/**
 * Variante du logo SaaS avec badge de version ou statut
 */
export function SaasLogoBadge({ 
  size = 48,
  variant = 'default'
}: { 
  size?: number
  variant?: 'default' | 'active' | 'cloud'
}) {
  const badgeLabels = {
    default: 'SaaS',
    active: 'ACTIVE',
    cloud: 'CLOUD'
  }

  return (
    <div className={styles.badge}>
      <SaasLogo size={size} />
      <span className={`${styles.badgeLabel} ${styles[variant]}`}>
        {badgeLabels[variant]}
      </span>
    </div>
  )
}

