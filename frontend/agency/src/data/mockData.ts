import { Organization, User, Role, Permission } from '@/types/organization';

// Permissions disponibles
export const ALL_PERMISSIONS: Permission[] = [
  'organizations:read',
  'organizations:write',
  'organizations:delete',
  'users:read',
  'users:write',
  'users:delete',
  'roles:read',
  'roles:write',
  'roles:delete',
  'properties:read',
  'properties:write',
  'properties:delete',
  'settings:read',
  'settings:write',
];

// Organisations de test
export const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Immobilier Premium',
    slug: 'immobilier-premium',
    description: 'Agence immobilière spécialisée dans le luxe',
    logo: undefined,
    plan: 'enterprise',
    maxUsers: 50,
    isActive: true,
    country: 'France',
    city: 'Paris',
    parentId: undefined, // Organisation principale (pas de parent)
    // Informations légales
    legalName: 'IMMOBILIER PREMIUM SARL',
    registrationNumber: '123 456 789 00012',
    vatNumber: 'FR12 123456789',
    legalForm: 'SARL',
    siren: '123456789',
    siret: '12345678900012',
    rcsNumber: 'Paris B 123 456 789',
    foundingDate: '2010-05-15T00:00:00Z',
    // Informations financières
    currency: 'EUR',
    commissionRate: 5.5,
    paymentTerms: 'Net 30 jours',
    billingEmail: 'facturation@immobilier-premium.fr',
    // Informations métier
    website: 'https://www.immobilier-premium.fr',
    industry: 'Immobilier résidentiel de luxe',
    specialties: ['luxe', 'résidentiel', 'vente', 'location'],
    yearEstablished: 2010,
    languages: ['fr', 'en', 'es'],
    // Réseaux sociaux
    socialNetworks: {
      facebook: 'https://facebook.com/immobilierpremium',
      linkedin: 'https://linkedin.com/company/immobilier-premium',
      instagram: 'https://instagram.com/immobilierpremium',
    },
    // Gestion
    managerName: 'Sophie Martin',
    managerEmail: 'sophie.martin@immobilier-premium.fr',
    managerPhone: '+33 1 23 45 67 88',
    tags: ['VIP', 'Premium', 'Paris', 'Luxe'],
    internalCode: 'ORG-001',
    externalCode: 'CLIENT-PREMIUM-001',
    notes: 'Client VIP, traitement prioritaire. Partenaire privilégié depuis 2010.',
    // Contrat
    contractStartDate: '2024-01-01T00:00:00Z',
    contractEndDate: '2024-12-31T23:59:59Z',
    contractRenewalDate: '2024-12-01T00:00:00Z',
    subscriptionStatus: 'active',
    // Conformité
    complianceStatus: 'compliant',
    lastComplianceCheck: '2024-03-15T00:00:00Z',
    licenseNumber: 'CPI 7501 2020 00001',
    licenseAuthority: 'CCI Paris',
    licenseExpiryDate: '2025-12-31T23:59:59Z',
    // Relations (addresses, phones, emails)
    addresses: [
      {
        id: 'addr-1-1',
        type: 'headquarters',
        street: '123 Avenue des Champs-Élysées',
        city: 'Paris',
        postalCode: '75008',
        country: 'France',
        isPrimary: true,
      },
      {
        id: 'addr-1-2',
        type: 'branch',
        street: '45 Rue de la Paix',
        city: 'Paris',
        postalCode: '75002',
        country: 'France',
        isPrimary: false,
      },
    ],
    phones: [
      {
        id: 'phone-1-1',
        type: 'main',
        number: '+33 1 23 45 67 89',
        isPrimary: true,
      },
      {
        id: 'phone-1-2',
        type: 'sales',
        number: '+33 1 23 45 67 90',
        isPrimary: false,
      },
      {
        id: 'phone-1-3',
        type: 'support',
        number: '+33 1 23 45 67 91',
        isPrimary: false,
      },
    ],
    emails: [
      {
        id: 'email-1-1',
        type: 'main',
        address: 'contact@immobilier-premium.fr',
        isPrimary: true,
      },
      {
        id: 'email-1-2',
        type: 'sales',
        address: 'ventes@immobilier-premium.fr',
        isPrimary: false,
      },
      {
        id: 'email-1-3',
        type: 'support',
        address: 'support@immobilier-premium.fr',
        isPrimary: false,
      },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'org-2',
    name: 'Propriétés & Co',
    slug: 'proprietes-co',
    description: 'Réseau d\'agences immobilières',
    logo: undefined,
    plan: 'professional',
    maxUsers: 25,
    isActive: true,
    country: 'France',
    city: 'Lyon',
    parentId: 'org-1', // Filiale de Immobilier Premium
    // Informations légales
    legalName: 'PROPRIETES & CO SAS',
    registrationNumber: '456 789 123 00045',
    vatNumber: 'FR45 456789123',
    legalForm: 'SAS',
    siren: '456789123',
    siret: '45678912300045',
    rcsNumber: 'Lyon B 456 789 123',
    foundingDate: '2015-03-20T00:00:00Z',
    // Informations financières
    currency: 'EUR',
    commissionRate: 4.5,
    paymentTerms: 'Net 30 jours',
    billingEmail: 'compta@proprietes-co.fr',
    // Informations métier
    website: 'https://www.proprietes-co.fr',
    industry: 'Immobilier résidentiel et commercial',
    specialties: ['résidentiel', 'commercial', 'location', 'gestion'],
    yearEstablished: 2015,
    languages: ['fr', 'en'],
    // Réseaux sociaux
    socialNetworks: {
      facebook: 'https://facebook.com/proprietesco',
      linkedin: 'https://linkedin.com/company/proprietes-co',
    },
    // Gestion
    managerName: 'Pierre Dubois',
    managerEmail: 'pierre.dubois@proprietes-co.fr',
    managerPhone: '+33 4 78 12 34 55',
    tags: ['Réseau', 'Lyon', 'Professionnel'],
    internalCode: 'ORG-002',
    externalCode: 'CLIENT-PC-002',
    notes: 'Réseau d\'agences avec plusieurs succursales',
    // Contrat
    contractStartDate: '2024-01-15T00:00:00Z',
    contractEndDate: '2024-12-31T23:59:59Z',
    contractRenewalDate: '2024-12-15T00:00:00Z',
    subscriptionStatus: 'active',
    // Conformité
    complianceStatus: 'compliant',
    lastComplianceCheck: '2024-02-10T00:00:00Z',
    licenseNumber: 'CPI 6901 2021 00045',
    licenseAuthority: 'CCI Lyon',
    licenseExpiryDate: '2025-12-31T23:59:59Z',
    // Relations (addresses, phones, emails)
    addresses: [
      {
        id: 'addr-2-1',
        type: 'headquarters',
        street: '78 Rue de la République',
        city: 'Lyon',
        postalCode: '69002',
        country: 'France',
        isPrimary: true,
      },
      {
        id: 'addr-2-2',
        type: 'branch',
        street: '12 Place Bellecour',
        city: 'Lyon',
        postalCode: '69002',
        country: 'France',
        isPrimary: false,
      },
    ],
    phones: [
      {
        id: 'phone-2-1',
        type: 'main',
        number: '+33 4 78 12 34 56',
        isPrimary: true,
      },
      {
        id: 'phone-2-2',
        type: 'sales',
        number: '+33 4 78 12 34 57',
        isPrimary: false,
      },
    ],
    emails: [
      {
        id: 'email-2-1',
        type: 'main',
        address: 'contact@proprietes-co.fr',
        isPrimary: true,
      },
      {
        id: 'email-2-2',
        type: 'billing',
        address: 'facturation@proprietes-co.fr',
        isPrimary: false,
      },
    ],
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-10T16:45:00Z',
  },
  {
    id: 'org-3',
    name: 'Maisons & Appartements',
    slug: 'maisons-appartements',
    description: 'Agence locale de quartier',
    logo: undefined,
    plan: 'basic',
    maxUsers: 10,
    isActive: true,
    country: 'France',
    city: 'Marseille',
    parentId: 'org-1', // Filiale de Immobilier Premium
    addresses: [
      {
        id: 'addr-3-1',
        type: 'headquarters',
        street: '56 Boulevard de la Canebière',
        city: 'Marseille',
        postalCode: '13001',
        country: 'France',
        isPrimary: true,
      },
    ],
    phones: [
      {
        id: 'phone-3-1',
        type: 'main',
        number: '+33 4 91 23 45 67',
        isPrimary: true,
      },
    ],
    emails: [
      {
        id: 'email-3-1',
        type: 'main',
        address: 'contact@maisons-appartements.fr',
        isPrimary: true,
      },
    ],
    createdAt: '2024-02-15T11:00:00Z',
    updatedAt: '2024-02-15T11:00:00Z',
  },
  {
    id: 'org-4',
    name: 'Test Agency',
    slug: 'test-agency',
    description: 'Organisation de test',
    logo: undefined,
    plan: 'free',
    maxUsers: 3,
    isActive: false,
    country: 'France',
    city: 'Toulouse',
    parentId: 'org-5', // Filiale de Real Estate Solutions
    createdAt: '2024-03-01T08:00:00Z',
    updatedAt: '2024-03-05T12:00:00Z',
  },
  {
    id: 'org-5',
    name: 'Real Estate Solutions',
    slug: 'real-estate-solutions',
    description: 'Solutions immobilières innovantes pour les professionnels',
    logo: undefined,
    plan: 'enterprise',
    maxUsers: 100,
    isActive: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    country: 'France',
    city: 'Lyon',
  },
  {
    id: 'org-6',
    name: 'Urban Properties',
    slug: 'urban-properties',
    description: 'Spécialiste de l\'immobilier urbain',
    logo: undefined,
    plan: 'professional',
    maxUsers: 30,
    isActive: true,
    parentId: 'org-5', // Filiale de Real Estate Solutions
    createdAt: '2024-01-20T09:30:00Z',
    updatedAt: '2024-03-10T14:20:00Z',
    country: 'France',
    city: 'Marseille',
  },
  {
    id: 'org-7',
    name: 'Luxury Homes',
    slug: 'luxury-homes',
    description: 'Prestige et excellence dans l\'immobilier de luxe',
    logo: undefined,
    plan: 'enterprise',
    maxUsers: 75,
    isActive: true,
    createdAt: '2024-01-25T10:15:00Z',
    updatedAt: '2024-03-18T16:45:00Z',
    country: 'France',
    city: 'Nice',
  },
  {
    id: 'org-8',
    name: 'Family Realty',
    slug: 'family-realty',
    description: 'Agence familiale au service de vos projets',
    logo: undefined,
    plan: 'basic',
    maxUsers: 15,
    isActive: true,
    parentId: 'org-5', // Filiale de Real Estate Solutions
    createdAt: '2024-02-05T11:00:00Z',
    updatedAt: '2024-03-12T09:30:00Z',
    country: 'France',
    city: 'Bordeaux',
  },
  {
    id: 'org-9',
    name: 'Commercial Spaces',
    slug: 'commercial-spaces',
    description: 'Expert en locaux commerciaux et bureaux',
    logo: undefined,
    plan: 'professional',
    maxUsers: 40,
    isActive: true,
    parentId: 'org-2', // Filiale de Propriétés & Co (qui est elle-même une filiale de org-1)
    createdAt: '2024-02-10T13:20:00Z',
    updatedAt: '2024-03-20T11:15:00Z',
    country: 'France',
    city: 'Nantes',
  },
  {
    id: 'org-10',
    name: 'Green Properties',
    slug: 'green-properties',
    description: 'Immobilier écologique et durable',
    logo: undefined,
    plan: 'basic',
    maxUsers: 12,
    isActive: true,
    createdAt: '2024-02-12T14:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    country: 'France',
    city: 'Strasbourg',
  },
  {
    id: 'org-11',
    name: 'Coastal Estates',
    slug: 'coastal-estates',
    description: 'Propriétés en bord de mer et résidences secondaires',
    logo: undefined,
    plan: 'professional',
    maxUsers: 35,
    isActive: true,
    createdAt: '2024-02-15T15:30:00Z',
    updatedAt: '2024-03-19T13:45:00Z',
    country: 'France',
    city: 'Cannes',
  },
  {
    id: 'org-12',
    name: 'Student Housing',
    slug: 'student-housing',
    description: 'Logements étudiants et colocations',
    logo: undefined,
    plan: 'basic',
    maxUsers: 8,
    isActive: true,
    createdAt: '2024-02-18T09:00:00Z',
    updatedAt: '2024-03-10T08:30:00Z',
    country: 'France',
    city: 'Lille',
  },
  {
    id: 'org-13',
    name: 'Investment Group',
    slug: 'investment-group',
    description: 'Gestion de portefeuille immobilier',
    logo: undefined,
    plan: 'enterprise',
    maxUsers: 60,
    isActive: true,
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-03-21T15:00:00Z',
    country: 'France',
    city: 'Reims',
  },
  {
    id: 'org-14',
    name: 'Rural Properties',
    slug: 'rural-properties',
    description: 'Fermes, domaines et propriétés rurales',
    logo: undefined,
    plan: 'basic',
    maxUsers: 10,
    isActive: true,
    createdAt: '2024-02-22T11:15:00Z',
    updatedAt: '2024-03-14T12:00:00Z',
    country: 'France',
    city: 'Grenoble',
  },
  {
    id: 'org-15',
    name: 'Tech Real Estate',
    slug: 'tech-real-estate',
    description: 'Immobilier nouvelle génération avec technologie avancée',
    logo: undefined,
    plan: 'professional',
    maxUsers: 45,
    isActive: true,
    createdAt: '2024-02-25T12:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z',
    country: 'France',
    city: 'Paris',
  },
  {
    id: 'org-16',
    name: 'Historic Homes',
    slug: 'historic-homes',
    description: 'Patrimoine et biens historiques',
    logo: undefined,
    plan: 'basic',
    maxUsers: 7,
    isActive: false,
    createdAt: '2024-03-01T08:30:00Z',
    updatedAt: '2024-03-05T10:00:00Z',
    country: 'France',
    city: 'Dijon',
  },
  {
    id: 'org-17',
    name: 'Corporate Realty',
    slug: 'corporate-realty',
    description: 'Solutions immobilières pour entreprises',
    logo: undefined,
    plan: 'enterprise',
    maxUsers: 80,
    isActive: true,
    createdAt: '2024-03-03T09:00:00Z',
    updatedAt: '2024-03-22T16:00:00Z',
    country: 'France',
    city: 'Reims',
  },
  {
    id: 'org-18',
    name: 'Vacation Rentals',
    slug: 'vacation-rentals',
    description: 'Location saisonnière et locations de vacances',
    logo: undefined,
    plan: 'professional',
    maxUsers: 28,
    isActive: true,
    createdAt: '2024-03-05T10:30:00Z',
    updatedAt: '2024-03-18T11:30:00Z',
    country: 'France',
    city: 'Grenoble',
  },
  {
    id: 'org-19',
    name: 'First Time Buyers',
    slug: 'first-time-buyers',
    description: 'Accompagnement des primo-accédants',
    logo: undefined,
    plan: 'basic',
    maxUsers: 12,
    isActive: true,
    createdAt: '2024-03-07T11:00:00Z',
    updatedAt: '2024-03-16T09:15:00Z',
    country: 'Belgium',
    city: 'Brussels',
  },
  {
    id: 'org-20',
    name: 'Luxury Estates',
    slug: 'luxury-estates',
    description: 'Domaines et propriétés d\'exception',
    logo: undefined,
    plan: 'enterprise',
    maxUsers: 90,
    isActive: true,
    createdAt: '2024-03-08T12:00:00Z',
    updatedAt: '2024-03-21T17:00:00Z',
    country: 'Switzerland',
    city: 'Geneva',
  },
  {
    id: 'org-21',
    name: 'Quick Sale',
    slug: 'quick-sale',
    description: 'Vente rapide de biens immobiliers',
    logo: undefined,
    plan: 'free',
    maxUsers: 3,
    isActive: true,
    createdAt: '2024-03-10T13:00:00Z',
    updatedAt: '2024-03-15T10:30:00Z',
    country: 'France',
    city: 'Dijon',
  },
  {
    id: 'org-22',
    name: 'Property Management Pro',
    slug: 'property-management-pro',
    description: 'Gestion locative professionnelle',
    logo: undefined,
    plan: 'professional',
    maxUsers: 50,
    isActive: true,
    createdAt: '2024-03-12T14:00:00Z',
    updatedAt: '2024-03-20T15:00:00Z',
    country: 'Spain',
    city: 'Barcelona',
  },
  {
    id: 'org-23',
    name: 'Eco Living',
    slug: 'eco-living',
    description: 'Habitat écologique et énergies renouvelables',
    logo: undefined,
    plan: 'basic',
    maxUsers: 15,
    isActive: true,
    createdAt: '2024-03-13T15:00:00Z',
    updatedAt: '2024-03-19T12:00:00Z',
    country: 'Germany',
    city: 'Berlin',
  },
  {
    id: 'org-24',
    name: 'International Properties',
    slug: 'international-properties',
    description: 'Biens immobiliers à l\'international',
    logo: undefined,
    plan: 'enterprise',
    maxUsers: 70,
    isActive: true,
    createdAt: '2024-03-14T16:00:00Z',
    updatedAt: '2024-03-22T14:00:00Z',
    country: 'France',
    city: 'Angers',
  },
  {
    id: 'org-25',
    name: 'Senior Living',
    slug: 'senior-living',
    description: 'Résidences seniors et EHPAD',
    logo: undefined,
    plan: 'professional',
    maxUsers: 32,
    isActive: true,
    createdAt: '2024-03-15T09:00:00Z',
    updatedAt: '2024-03-21T10:00:00Z',
    country: 'France',
    city: 'Nîmes',
  },
  {
    id: 'org-26',
    name: 'Studio Apartments',
    slug: 'studio-apartments',
    description: 'Studios et petits appartements',
    logo: undefined,
    plan: 'basic',
    maxUsers: 9,
    isActive: false,
    createdAt: '2024-03-16T10:00:00Z',
    updatedAt: '2024-03-18T11:00:00Z',
    country: 'France',
    city: 'Paris',
  },
  {
    id: 'org-27',
    name: 'Mountain Properties',
    slug: 'mountain-properties',
    description: 'Chalets et propriétés de montagne',
    logo: undefined,
    plan: 'professional',
    maxUsers: 25,
    isActive: true,
    createdAt: '2024-03-17T11:00:00Z',
    updatedAt: '2024-03-20T13:00:00Z',
    country: 'France',
    city: 'Paris',
  },
  {
    id: 'org-28',
    name: 'Smart Homes',
    slug: 'smart-homes',
    description: 'Maisons connectées et domotique',
    logo: undefined,
    plan: 'basic',
    maxUsers: 11,
    isActive: true,
    createdAt: '2024-03-18T12:00:00Z',
    updatedAt: '2024-03-22T09:00:00Z',
    country: 'France',
    city: 'Paris',
  },
  {
    id: 'org-29',
    name: 'Industrial Real Estate',
    slug: 'industrial-real-estate',
    description: 'Entrepôts, usines et locaux industriels',
    logo: undefined,
    plan: 'enterprise',
    maxUsers: 55,
    isActive: true,
    createdAt: '2024-03-19T13:00:00Z',
    updatedAt: '2024-03-21T15:30:00Z',
    country: 'France',
    city: 'Paris',
  },
  {
    id: 'org-30',
    name: 'New Construction',
    slug: 'new-construction',
    description: 'Programmes neufs et constructions',
    logo: undefined,
    plan: 'professional',
    maxUsers: 38,
    isActive: true,
    createdAt: '2024-03-20T14:00:00Z',
    updatedAt: '2024-03-22T11:00:00Z',
    country: 'France',
    city: 'Paris',
  },
  {
    id: 'org-31',
    name: 'Budget Housing',
    slug: 'budget-housing',
    description: 'Logements sociaux et accessibles',
    logo: undefined,
    plan: 'free',
    maxUsers: 5,
    isActive: true,
    createdAt: '2024-03-21T15:00:00Z',
    updatedAt: '2024-03-22T10:00:00Z',
    country: 'France',
    city: 'Paris',
  },
  {
    id: 'org-32',
    name: 'Boutique Realty',
    slug: 'boutique-realty',
    description: 'Agence immobilière de proximité',
    logo: undefined,
    plan: 'basic',
    maxUsers: 6,
    isActive: true,
    createdAt: '2024-03-22T08:00:00Z',
    updatedAt: '2024-03-22T12:00:00Z',
    country: 'France',
    city: 'Paris',
  },
  {
    id: 'org-33',
    name: 'Global Real Estate',
    slug: 'global-real-estate',
    description: 'Réseau international d\'agences',
    logo: undefined,
    plan: 'enterprise',
    maxUsers: 120,
    isActive: true,
    createdAt: '2024-03-22T09:00:00Z',
    updatedAt: '2024-03-22T16:00:00Z',
    country: 'France',
    city: 'Paris',
  },
  {
    id: 'org-34',
    name: 'Urban Development',
    slug: 'urban-development',
    description: 'Aménagement urbain et projets immobiliers',
    logo: undefined,
    plan: 'professional',
    maxUsers: 42,
    isActive: true,
    createdAt: '2024-03-22T10:00:00Z',
    updatedAt: '2024-03-22T14:00:00Z',
    country: 'France',
    city: 'Reims',
  },
];

// Rôles de test
export const mockRoles: Role[] = [
  {
    id: 'role-1',
    name: 'Super Admin',
    description: 'Accès complet à toutes les fonctionnalités',
    permissions: ALL_PERMISSIONS,
    organizationId: 'org-1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'role-2',
    name: 'Administrateur',
    description: 'Gestion complète de l\'organisation et des utilisateurs',
    permissions: [
      'organizations:read',
      'organizations:write',
      'users:read',
      'users:write',
      'users:delete',
      'roles:read',
      'roles:write',
      'properties:read',
      'properties:write',
      'properties:delete',
      'settings:read',
      'settings:write',
    ],
    organizationId: 'org-1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'role-3',
    name: 'Gestionnaire',
    description: 'Gestion des propriétés et consultation des utilisateurs',
    permissions: [
      'users:read',
      'properties:read',
      'properties:write',
      'properties:delete',
      'settings:read',
    ],
    organizationId: 'org-1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'role-4',
    name: 'Agent',
    description: 'Consultation et modification des propriétés',
    permissions: [
      'properties:read',
      'properties:write',
    ],
    organizationId: 'org-1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'role-5',
    name: 'Lecteur',
    description: 'Consultation uniquement',
    permissions: [
      'properties:read',
      'users:read',
    ],
    organizationId: 'org-1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'role-6',
    name: 'Administrateur',
    description: 'Gestion de l\'organisation',
    permissions: [
      'organizations:read',
      'organizations:write',
      'users:read',
      'users:write',
      'roles:read',
      'roles:write',
      'properties:read',
      'properties:write',
      'settings:read',
      'settings:write',
    ],
    organizationId: 'org-2',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-01T09:00:00Z',
  },
];

// Utilisateurs de test
// Note: role field matches organization-service entity structure (role name as string)
// roleId is kept for frontend compatibility with components
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@immobilier-premium.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    avatar: undefined,
    role: 'Super Admin', // Entity uses role (string name)
    roleId: 'role-1', // Frontend compatibility
    organizationId: 'org-1',
    isActive: true,
    lastLoginAt: '2024-03-20T09:15:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-20T09:15:00Z',
  },
  {
    id: 'user-2',
    email: 'marie.martin@immobilier-premium.com',
    firstName: 'Marie',
    lastName: 'Martin',
    avatar: undefined,
    role: 'Administrateur',
    roleId: 'role-2',
    organizationId: 'org-1',
    isActive: true,
    lastLoginAt: '2024-03-19T14:30:00Z',
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-03-19T14:30:00Z',
  },
  {
    id: 'user-3',
    email: 'pierre.bernard@immobilier-premium.com',
    firstName: 'Pierre',
    lastName: 'Bernard',
    avatar: undefined,
    role: 'Gestionnaire',
    roleId: 'role-3',
    organizationId: 'org-1',
    isActive: true,
    lastLoginAt: '2024-03-18T16:45:00Z',
    createdAt: '2024-01-17T12:00:00Z',
    updatedAt: '2024-03-18T16:45:00Z',
  },
  {
    id: 'user-4',
    email: 'sophie.durand@immobilier-premium.com',
    firstName: 'Sophie',
    lastName: 'Durand',
    avatar: undefined,
    role: 'Agent',
    roleId: 'role-4',
    organizationId: 'org-1',
    isActive: true,
    lastLoginAt: '2024-03-17T10:20:00Z',
    createdAt: '2024-01-18T13:00:00Z',
    updatedAt: '2024-03-17T10:20:00Z',
  },
  {
    id: 'user-5',
    email: 'lucas.moreau@immobilier-premium.com',
    firstName: 'Lucas',
    lastName: 'Moreau',
    avatar: undefined,
    role: 'Agent',
    roleId: 'role-4',
    organizationId: 'org-1',
    isActive: false,
    lastLoginAt: '2024-02-15T08:00:00Z',
    createdAt: '2024-01-19T14:00:00Z',
    updatedAt: '2024-02-20T15:00:00Z',
  },
  {
    id: 'user-6',
    email: 'admin@proprietes-co.com',
    firstName: 'Thomas',
    lastName: 'Lefebvre',
    avatar: undefined,
    role: 'Administrateur',
    roleId: 'role-6',
    organizationId: 'org-2',
    isActive: true,
    lastLoginAt: '2024-03-19T11:00:00Z',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-03-19T11:00:00Z',
  },
  {
    id: 'user-7',
    email: 'agent1@proprietes-co.com',
    firstName: 'Emma',
    lastName: 'Petit',
    avatar: undefined,
    role: 'Agent',
    roleId: 'role-4',
    organizationId: 'org-2',
    isActive: true,
    lastLoginAt: '2024-03-18T13:30:00Z',
    createdAt: '2024-02-02T10:00:00Z',
    updatedAt: '2024-03-18T13:30:00Z',
  },
];

// Fonctions utilitaires pour récupérer les données
export const getOrganizationById = (id: string): Organization | undefined => {
  return mockOrganizations.find(org => org.id === id);
};

export const getUsersByOrganization = (organizationId: string): User[] => {
  return mockUsers.filter(user => user.organizationId === organizationId);
};

export const getRolesByOrganization = (organizationId: string): Role[] => {
  return mockRoles.filter(role => role.organizationId === organizationId);
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getRoleById = (id: string): Role | undefined => {
  return mockRoles.find(role => role.id === id);
};

export const getUserWithRole = (user: User): { user: User; role: Role | undefined } => {
  // Support both roleId (for mock data) and role (from entity)
  const roleId = user.roleId || (user.role ? mockRoles.find(r => r.name === user.role)?.id : undefined);
  return {
    user,
    role: roleId ? getRoleById(roleId) : undefined,
  };
};

export const getOrganizationWithStats = (org: Organization): Organization & { userCount: number; activeUserCount: number } => {
  const users = getUsersByOrganization(org.id);
  return {
    ...org,
    userCount: users.length,
    activeUserCount: users.filter(u => u.isActive).length,
  };
};

// Récupérer les sous-organisations d'une organisation
export const getSubOrganizations = (organizationId: string): Organization[] => {
  return mockOrganizations.filter(org => org.parentId === organizationId);
};

// Récupérer l'organisation parente
export const getParentOrganization = (organizationId: string): Organization | undefined => {
  const org = getOrganizationById(organizationId);
  if (!org || !org.parentId) return undefined;
  return getOrganizationById(org.parentId);
};

// Récupérer toutes les sous-organisations récursivement (avec stats)
export const getAllSubOrganizations = (organizationId: string): (Organization & { userCount: number; activeUserCount: number })[] => {
  const subOrgs = getSubOrganizations(organizationId);
  return subOrgs.map(org => getOrganizationWithStats(org));
};

// Interface pour représenter un nœud dans l'arbre hiérarchique
export interface OrganizationTreeNode extends Organization {
  children: OrganizationTreeNode[];
  userCount: number;
  activeUserCount: number;
  level: number; // Niveau dans la hiérarchie (0 = racine)
}

// Fonction pour trouver la racine d'une organisation (remonte jusqu'à la racine)
export const getRootOrganization = (organizationId: string): Organization | undefined => {
  const org = getOrganizationById(organizationId);
  if (!org) return undefined;
  
  if (!org.parentId) {
    return org; // C'est déjà la racine
  }
  
  return getRootOrganization(org.parentId); // Récursion pour remonter
};

// Fonction pour construire l'arbre complet depuis une organisation racine
export const buildOrganizationTree = (rootOrgId: string): OrganizationTreeNode | null => {
  const rootOrg = getOrganizationById(rootOrgId);
  if (!rootOrg) return null;
  
  const buildNode = (org: Organization, level: number = 0): OrganizationTreeNode => {
    const stats = getOrganizationWithStats(org);
    const children = getSubOrganizations(org.id);
    
    return {
      ...stats,
      children: children.map(child => buildNode(child, level + 1)),
      level,
    };
  };
  
  return buildNode(rootOrg);
};

// Fonction pour obtenir l'arbre complet centré sur une organisation donnée
export const getOrganizationTree = (organizationId: string): OrganizationTreeNode | null => {
  const rootOrg = getRootOrganization(organizationId);
  if (!rootOrg) return null;
  
  return buildOrganizationTree(rootOrg.id);
};

// Fonction pour obtenir toutes les organisations dans un arbre (aplati)
export const flattenOrganizationTree = (tree: OrganizationTreeNode | null): OrganizationTreeNode[] => {
  if (!tree) return [];
  
  const result: OrganizationTreeNode[] = [tree];
  
  tree.children.forEach(child => {
    result.push(...flattenOrganizationTree(child));
  });
  
  return result;
};

// Fonction pour mettre à jour une organisation (simulation)
export const updateOrganization = (updatedOrg: Organization): Organization | undefined => {
  const index = mockOrganizations.findIndex(org => org.id === updatedOrg.id);
  if (index !== -1) {
    mockOrganizations[index] = { ...mockOrganizations[index], ...updatedOrg, updatedAt: new Date().toISOString() };
    return mockOrganizations[index];
  }
  return undefined;
};

// Fonction pour inviter un utilisateur (simulation)
export const inviteUser = (data: {
  email: string;
  firstName?: string;
  lastName?: string;
  roleId: string;
  organizationId: string;
}): User => {
  const role = getRoleById(data.roleId);
  if (!role) {
    throw new Error(`Role with id ${data.roleId} not found`);
  }

  if (role.organizationId !== data.organizationId) {
    throw new Error(`Role does not belong to organization ${data.organizationId}`);
  }

  // Vérifier si l'utilisateur existe déjà dans cette organisation
  const existingUser = mockUsers.find(
    (u) => u.email === data.email && u.organizationId === data.organizationId
  );

  if (existingUser) {
    throw new Error(`User with email ${data.email} already exists in this organization`);
  }

  const now = new Date().toISOString();
  const roleName = role.name; // Use role name for 'role' field (matching entity structure)
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: data.email,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    role: roleName, // Entity uses role (string name)
    roleId: data.roleId, // Keep roleId for frontend compatibility
    organizationId: data.organizationId,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  mockUsers.push(newUser);
  return newUser;
};

// Fonction pour créer une nouvelle organisation (simulation)
export const createOrganization = (data: {
  name: string;
  slug: string;
  description?: string;
  plan: 'free' | 'basic' | 'professional' | 'enterprise';
  maxUsers: number;
  isActive: boolean;
  country?: string;
  city?: string;
  parentId?: string;
}): Organization => {
  // Vérifier que le slug est unique
  const existingOrg = mockOrganizations.find((org) => org.slug === data.slug);
  if (existingOrg) {
    throw new Error(`Organization with slug ${data.slug} already exists`);
  }

  // Vérifier que le parent existe si parentId est fourni et éviter les références circulaires
  if (data.parentId) {
    const parentOrg = mockOrganizations.find((org) => org.id === data.parentId);
    if (!parentOrg) {
      throw new Error(`Parent organization with id ${data.parentId} not found`);
    }
    if (!parentOrg.isActive) {
      throw new Error(`Parent organization ${parentOrg.name} is not active`);
    }
    
    // Vérifier qu'on ne crée pas une référence circulaire (le parent ne peut pas être un enfant de cette nouvelle org)
    // Cette vérification sera plus complexe une fois l'organisation créée, mais pour l'instant on peut ignorer
    // car on crée une nouvelle organisation qui n'a pas encore d'enfants
  }

  const now = new Date().toISOString();
  const newOrganization: Organization = {
    id: `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    slug: data.slug,
    description: data.description,
    plan: data.plan,
    maxUsers: data.maxUsers,
    isActive: data.isActive,
    country: data.country,
    city: data.city,
    parentId: data.parentId,
    createdAt: now,
    updatedAt: now,
  };

  mockOrganizations.push(newOrganization);
  return newOrganization;
};

/**
 * Update the parentId of an existing organization
 * Validates that the parent exists, is active, and prevents circular references
 */
export const setOrganizationParent = (organizationId: string, parentId: string | null | undefined): Organization | undefined => {
  const organization = mockOrganizations.find((org) => org.id === organizationId);
  if (!organization) {
    throw new Error(`Organization with id ${organizationId} not found`);
  }

  // Si parentId est null ou undefined, on retire le parent (devient une organisation racine)
  if (!parentId || parentId === 'none') {
    organization.parentId = undefined;
    organization.updatedAt = new Date().toISOString();
    return organization;
  }

  // Vérifier que le nouveau parent existe
  const newParent = mockOrganizations.find((org) => org.id === parentId);
  if (!newParent) {
    throw new Error(`Parent organization with id ${parentId} not found`);
  }

  if (!newParent.isActive) {
    throw new Error(`Parent organization ${newParent.name} is not active`);
  }

  // Vérifier qu'on ne crée pas une référence circulaire
  // Le nouveau parent ne doit pas être un descendant de l'organisation
  const allDescendants = getAllSubOrganizations(organizationId);
  if (allDescendants.some((desc) => desc.id === parentId)) {
    throw new Error(`Cannot set parent: would create a circular reference. ${newParent.name} is a descendant of ${organization.name}`);
  }

  // Vérifier qu'on ne se définit pas soi-même comme parent
  if (organizationId === parentId) {
    throw new Error('An organization cannot be its own parent');
  }

  // Mettre à jour le parentId
  organization.parentId = parentId;
  organization.updatedAt = new Date().toISOString();
  return organization;
};

/**
 * Delete a single user by ID
 */
export const deleteUser = (userId: string): boolean => {
  const index = mockUsers.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error(`User with id ${userId} not found`);
  }
  mockUsers.splice(index, 1);
  return true;
};

/**
 * Delete multiple users by IDs
 */
export const deleteUsers = (userIds: string[]): { deleted: number; errors: string[] } => {
  const errors: string[] = [];
  let deleted = 0;

  userIds.forEach((userId) => {
    try {
      deleteUser(userId);
      deleted++;
    } catch (error) {
      errors.push(`${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return { deleted, errors };
};

/**
 * Delete a single organization by ID
 * Also removes all sub-organizations (cascading delete)
 */
export const deleteOrganization = (organizationId: string): boolean => {
  const index = mockOrganizations.findIndex((org) => org.id === organizationId);
  if (index === -1) {
    throw new Error(`Organization with id ${organizationId} not found`);
  }

  // Cascading delete: Supprimer tous les sous-organisations
  const subOrgs = getAllSubOrganizations(organizationId);
  subOrgs.forEach((subOrg) => {
    const subIndex = mockOrganizations.findIndex((org) => org.id === subOrg.id);
    if (subIndex !== -1) {
      mockOrganizations.splice(subIndex, 1);
    }
  });

  // Supprimer l'organisation elle-même
  mockOrganizations.splice(index, 1);

  // Supprimer aussi tous les utilisateurs de cette organisation et de ses sous-organisations
  const allOrgIds = [organizationId, ...subOrgs.map((sub) => sub.id)];
  const usersToDelete = mockUsers.filter((u) => u.organizationId && allOrgIds.includes(u.organizationId));
  usersToDelete.forEach((user) => {
    const userIndex = mockUsers.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
      mockUsers.splice(userIndex, 1);
    }
  });

  return true;
};

/**
 * Delete multiple organizations by IDs
 */
export const deleteOrganizations = (organizationIds: string[]): { deleted: number; errors: string[] } => {
  const errors: string[] = [];
  let deleted = 0;

  // Trier pour supprimer d'abord les sous-organisations
  // (ceci évite certaines erreurs de référence, mais la logique de deleteOrganization gère déjà le cascading)
  const sortedIds = [...organizationIds];

  sortedIds.forEach((orgId) => {
    try {
      deleteOrganization(orgId);
      deleted++;
    } catch (error) {
      errors.push(`${orgId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return { deleted, errors };
};

/**
 * Invite multiple users at once
 */
export const inviteUsers = (data: Array<{
  email: string;
  firstName?: string;
  lastName?: string;
  roleId: string;
  organizationId: string;
}>): { created: User[]; errors: Array<{ email: string; error: string }> } => {
  const created: User[] = [];
  const errors: Array<{ email: string; error: string }> = [];

  data.forEach((userData) => {
    try {
      const newUser = inviteUser(userData);
      created.push(newUser);
    } catch (error) {
      errors.push({
        email: userData.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return { created, errors };
};

