/**
 * Mock data for Neighborhood Service
 * Used for frontend development without backend API
 */

import { Neighborhood } from '@/lib/api/neighborhood';

export const mockNeighborhoods: Neighborhood[] = [
  {
    id: '1',
    slug: 'le-marais-paris',
    name: 'Le Marais',
    description: {
      fr: 'Quartier historique et branché de Paris, connu pour ses hôtels particuliers, ses musées, ses boutiques de créateurs et sa vie nocturne animée. Ambiance bohème et chic.',
      en: 'Historic and trendy district of Paris, known for its private mansions, museums, designer boutiques, and lively nightlife. Bohemian and chic atmosphere.',
    },
    city: 'Paris',
    region: 'Île-de-France',
    country: 'France',
    postalCode: '75003',
    centerLatitude: 48.859,
    centerLongitude: 2.361,
    stats: {
      propertyCount: 156,
      averagePriceOverall: 12000,
      medianPrice: 11500,
      minPrice: 8000,
      maxPrice: 20000,
      averagePrice: {
        apartment: 12000,
      },
    },
    features: {
      type: 'historic',
      safetyScore: 9,
      qualityOfLife: 9,
      publicTransport: {
        metro: true,
        bus: true,
        stations: ['Hôtel de Ville', 'Saint-Paul'],
      },
      amenities: {
        schools: 8,
        hospitals: 2,
        parks: 3,
        shopping: true,
        restaurants: true,
        nightlife: true,
        sports: true,
      },
      demographics: {
        averageAge: 38,
        population: 25000,
        familyFriendly: true,
        studentArea: false,
        seniorFriendly: true,
      },
    },
    mediaUrls: ['https://images.unsplash.com/photo-1502602898669-a38738f107f3?w=800'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    slug: 'saint-germain-des-pres-paris',
    name: 'Saint-Germain-des-Prés',
    description: {
      fr: "Quartier emblématique de la rive gauche parisienne, berceau de l'existentialisme, avec ses cafés littéraires, galeries d'art et boutiques de luxe. Élégance et histoire.",
      en: 'Iconic Left Bank district of Paris, birthplace of existentialism, with its literary cafes, art galleries, and luxury boutiques. Elegance and history.',
    },
    city: 'Paris',
    region: 'Île-de-France',
    country: 'France',
    postalCode: '75006',
    centerLatitude: 48.853,
    centerLongitude: 2.333,
    stats: {
      propertyCount: 142,
      averagePriceOverall: 15000,
      medianPrice: 14000,
      minPrice: 10000,
      maxPrice: 25000,
      averagePrice: {
        apartment: 15000,
      },
    },
    features: {
      type: 'historic',
      safetyScore: 9,
      qualityOfLife: 10,
      publicTransport: {
        metro: true,
        bus: true,
        stations: ['Saint-Germain-des-Prés', 'Odéon'],
      },
      amenities: {
        schools: 9,
        hospitals: 1,
        parks: 2,
        shopping: true,
        restaurants: true,
        nightlife: true,
        sports: true,
      },
      demographics: {
        averageAge: 42,
        population: 18000,
        familyFriendly: true,
        studentArea: false,
        seniorFriendly: true,
      },
    },
    mediaUrls: ['https://images.unsplash.com/photo-1549144521-3f09e92a11b3?w=800'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    slug: 'montmartre-paris',
    name: 'Montmartre',
    description: {
      fr: "Village d'artistes perché sur une colline, dominé par le Sacré-Cœur. Rues pavées, ateliers d'artistes, vues panoramiques sur Paris. Ambiance pittoresque et touristique.",
      en: "Artists' village perched on a hill, dominated by the Sacré-Cœur. Cobblestone streets, artist studios, panoramic views of Paris. Picturesque and touristy atmosphere.",
    },
    city: 'Paris',
    region: 'Île-de-France',
    country: 'France',
    postalCode: '75018',
    centerLatitude: 48.886,
    centerLongitude: 2.343,
    stats: {
      propertyCount: 178,
      averagePriceOverall: 9500,
      medianPrice: 9000,
      minPrice: 6000,
      maxPrice: 15000,
      averagePrice: {
        apartment: 9500,
      },
    },
    features: {
      type: 'tourist',
      safetyScore: 8,
      qualityOfLife: 8,
      publicTransport: {
        metro: true,
        bus: true,
        funicular: true,
        stations: ['Abbesses', 'Anvers'],
      },
      amenities: {
        schools: 7,
        hospitals: 1,
        parks: 1,
        shopping: true,
        restaurants: true,
        nightlife: true,
        sports: false,
      },
      demographics: {
        averageAge: 35,
        population: 20000,
        familyFriendly: true,
        studentArea: true,
        seniorFriendly: true,
      },
    },
    mediaUrls: ['https://images.unsplash.com/photo-1503377118-c47277105a07?w=800'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    slug: 'vieux-lyon',
    name: 'Vieux Lyon',
    description: {
      fr: "Quartier médiéval et Renaissance, classé au patrimoine mondial de l'UNESCO. Traboules, bouchons lyonnais et Cathédrale Saint-Jean. Ambiance historique et gastronomique.",
      en: 'Medieval and Renaissance district, a UNESCO World Heritage site. Traboules, traditional Lyonnaise restaurants, and Saint-Jean Cathedral. Historic and gastronomic atmosphere.',
    },
    city: 'Lyon',
    region: 'Auvergne-Rhône-Alpes',
    country: 'France',
    postalCode: '69005',
    centerLatitude: 45.762,
    centerLongitude: 4.827,
    stats: {
      propertyCount: 98,
      averagePriceOverall: 6200,
      medianPrice: 5800,
      minPrice: 4200,
      maxPrice: 9500,
      averagePrice: {
        apartment: 6200,
      },
    },
    features: {
      type: 'tourist',
      safetyScore: 8,
      qualityOfLife: 9,
      publicTransport: {
        metro: true,
        bus: true,
        tram: true,
        stations: ['Vieux Lyon - Cathédrale Saint-Jean'],
      },
      amenities: {
        schools: 6,
        hospitals: 1,
        parks: 2,
        shopping: true,
        restaurants: true,
        nightlife: true,
        sports: false,
      },
      demographics: {
        averageAge: 40,
        population: 7500,
        familyFriendly: true,
        studentArea: false,
        seniorFriendly: true,
      },
    },
    mediaUrls: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    slug: 'promenade-angles-nice',
    name: 'Promenade des Anglais',
    description: {
      fr: "Quartier emblématique de Nice avec sa célèbre promenade, plages privées, hôtels de luxe et vue exceptionnelle sur la Baie des Anges. Vie balnéaire toute l'année.",
      en: 'Iconic Nice neighborhood with its famous promenade, private beaches, luxury hotels, and exceptional views of the Bay of Angels. Year-round beach life.',
    },
    city: 'Nice',
    region: "Provence-Alpes-Côte d'Azur",
    country: 'France',
    postalCode: '06000',
    centerLatitude: 43.6954,
    centerLongitude: 7.2554,
    stats: {
      propertyCount: 203,
      averagePriceOverall: 8500,
      medianPrice: 7800,
      minPrice: 5500,
      maxPrice: 18000,
      averagePrice: {
        apartment: 7500,
        villa: 15000,
      },
    },
    features: {
      type: 'tourist',
      safetyScore: 9,
      qualityOfLife: 10,
      publicTransport: {
        tram: true,
        bus: true,
        train: true,
        stations: ['Masséna', 'Garibaldi'],
      },
      amenities: {
        schools: 10,
        hospitals: 2,
        parks: 4,
        shopping: true,
        restaurants: true,
        nightlife: true,
        beaches: true,
        sports: true,
      },
      demographics: {
        averageAge: 45,
        population: 12000,
        familyFriendly: true,
        studentArea: false,
        seniorFriendly: true,
      },
    },
    mediaUrls: ['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    slug: 'saint-pierre-bordeaux',
    name: 'Saint-Pierre',
    description: {
      fr: 'Quartier historique du centre de Bordeaux, proche de la place de la Bourse. Vieilles pierres, rues piétonnes, restaurants gastronomiques et vie culturelle riche.',
      en: 'Historic Bordeaux city center neighborhood, close to Place de la Bourse. Old stone buildings, pedestrian streets, gourmet restaurants, and rich cultural life.',
    },
    city: 'Bordeaux',
    region: 'Nouvelle-Aquitaine',
    country: 'France',
    postalCode: '33000',
    centerLatitude: 44.8378,
    centerLongitude: -0.5792,
    stats: {
      propertyCount: 134,
      averagePriceOverall: 5200,
      medianPrice: 4800,
      minPrice: 3500,
      maxPrice: 8200,
      averagePrice: {
        apartment: 5200,
      },
    },
    features: {
      type: 'mixed',
      safetyScore: 8,
      qualityOfLife: 9,
      publicTransport: {
        tram: true,
        bus: true,
        stations: ['Place de la Bourse'],
      },
      amenities: {
        schools: 8,
        hospitals: 1,
        parks: 3,
        shopping: true,
        restaurants: true,
        nightlife: true,
        sports: false,
      },
      demographics: {
        averageAge: 36,
        population: 8500,
        familyFriendly: true,
        studentArea: false,
        seniorFriendly: true,
      },
    },
    mediaUrls: ['https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '7',
    slug: 'vieux-port-marseille',
    name: 'Vieux-Port',
    description: {
      fr: 'Cœur historique de Marseille avec le port, les marchés aux poissons, les restaurants de bouillabaisse et la Canebière. Ambiance méditerranéenne authentique.',
      en: 'Historic heart of Marseille with the port, fish markets, bouillabaisse restaurants, and La Canebière. Authentic Mediterranean atmosphere.',
    },
    city: 'Marseille',
    region: "Provence-Alpes-Côte d'Azur",
    country: 'France',
    postalCode: '13001',
    centerLatitude: 43.2965,
    centerLongitude: 5.3698,
    stats: {
      propertyCount: 167,
      averagePriceOverall: 4800,
      medianPrice: 4500,
      minPrice: 3200,
      maxPrice: 7500,
      averagePrice: {
        apartment: 4800,
      },
    },
    features: {
      type: 'mixed',
      safetyScore: 7,
      qualityOfLife: 8,
      publicTransport: {
        metro: true,
        bus: true,
        stations: ['Vieux-Port', 'Canebière'],
      },
      amenities: {
        schools: 6,
        hospitals: 1,
        parks: 2,
        shopping: true,
        restaurants: true,
        nightlife: true,
        beaches: true,
        sports: false,
      },
      demographics: {
        averageAge: 39,
        population: 6500,
        familyFriendly: true,
        studentArea: false,
        seniorFriendly: false,
      },
    },
    mediaUrls: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

/**
 * Mock function to get all neighborhoods with filters
 */
export async function mockGetAllNeighborhoods(
  filters?: {
    city?: string;
    region?: string;
    country?: string;
    limit?: number;
    offset?: number;
  },
): Promise<{ data: Neighborhood[]; total: number }> {
  let filtered = [...mockNeighborhoods];

  if (filters?.city) {
    filtered = filtered.filter((n) => n.city.toLowerCase().includes(filters.city!.toLowerCase()));
  }
  if (filters?.region) {
    filtered = filtered.filter((n) => n.region?.toLowerCase().includes(filters.region!.toLowerCase()));
  }
  if (filters?.country) {
    filtered = filtered.filter((n) => n.country?.toLowerCase().includes(filters.country!.toLowerCase()));
  }

  const total = filtered.length;

  if (filters?.offset) {
    filtered = filtered.slice(filters.offset);
  }
  if (filters?.limit) {
    filtered = filtered.slice(0, filters.limit);
  }

  return { data: filtered, total };
}

/**
 * Mock function to get a neighborhood by slug
 */
export function mockGetNeighborhoodBySlug(slug: string): Neighborhood | null {
  return mockNeighborhoods.find((n) => n.slug === slug) || null;
}

/**
 * Mock function to search neighborhoods
 */
export function mockSearchNeighborhoods(query: string, limit = 10): Neighborhood[] {
  const lowerQuery = query.toLowerCase();
  const matches = mockNeighborhoods.filter(
    (n) =>
      n.name.toLowerCase().includes(lowerQuery) ||
      n.city.toLowerCase().includes(lowerQuery) ||
      n.region?.toLowerCase().includes(lowerQuery) ||
      n.country?.toLowerCase().includes(lowerQuery) ||
      n.description.fr?.toLowerCase().includes(lowerQuery) ||
      n.description.en?.toLowerCase().includes(lowerQuery),
  );

  return matches.slice(0, limit);
}
