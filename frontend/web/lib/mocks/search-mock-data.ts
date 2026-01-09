import { PropertySearchHit, SearchResult } from '@/lib/api/search';
import { PropertyType, PropertyStatus } from '@/lib/api/property';

/**
 * Mock data for testing the search page without calling real services
 */

export const mockProperties: Array<PropertySearchHit> = [
  {
    id: '1',
    userId: 'mock-user-1',
    status: PropertyStatus.LISTED,
    title_fr: 'Magnifique Villa avec Piscine',
    title_en: 'Beautiful Villa with Pool',
    description_fr: 'Superbe villa moderne de 250m² avec piscine, jardin et vue panoramique sur la mer. 5 chambres, 3 salles de bain. Parfait pour les familles.',
    description_en: 'Beautiful modern villa of 250m² with pool, garden and panoramic sea view. 5 bedrooms, 3 bathrooms. Perfect for families.',
    type: PropertyType.VILLA,
    price: 850000,
    currency: 'EUR',
    latitude: 48.8566,
    longitude: 2.3522,
    street: 'Avenue des Champs-Élysées',
    postalCode: '75008',
    city: 'Paris',
    region: 'Île-de-France',
    country: 'France',
    neighborhoodSlug: 'le-marais-paris',
    neighborhoodName_fr: 'Le Marais',
    neighborhoodName_en: 'Le Marais',
    mediaUrls: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    userId: 'mock-user-2',
    status: PropertyStatus.LISTED,
    title_fr: 'Appartement Moderne Centre-Ville',
    title_en: 'Modern City Center Apartment',
    description_fr: 'Appartement lumineux de 85m² au cœur de Paris, proche des transports et commerces. 2 chambres, balcon, rénové en 2023.',
    description_en: 'Bright 85m² apartment in the heart of Paris, close to transport and shops. 2 bedrooms, balcony, renovated in 2023.',
    type: PropertyType.APARTMENT,
    price: 450000,
    currency: 'EUR',
    latitude: 48.8606,
    longitude: 2.3376,
    street: 'Rue de Rivoli',
    postalCode: '75001',
    city: 'Paris',
    region: 'Île-de-France',
    country: 'France',
    neighborhoodSlug: 'le-marais-paris',
    neighborhoodName_fr: 'Le Marais',
    neighborhoodName_en: 'Le Marais',
    mediaUrls: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    ],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
  },
  {
    id: '3',
    userId: 'mock-user-3',
    status: PropertyStatus.LISTED,
    title_fr: 'Maison Familiale avec Jardin',
    title_en: 'Family House with Garden',
    description_fr: 'Charmante maison de 180m² avec grand jardin de 500m². 4 chambres, 2 salles de bain, garage. Quartier calme et résidentiel.',
    description_en: 'Charming 180m² house with large 500m² garden. 4 bedrooms, 2 bathrooms, garage. Quiet residential neighborhood.',
    type: PropertyType.HOUSE,
    price: 620000,
    currency: 'EUR',
    latitude: 48.8534,
    longitude: 2.3488,
    street: 'Boulevard Saint-Germain',
    postalCode: '75007',
    city: 'Paris',
    region: 'Île-de-France',
    country: 'France',
    neighborhoodSlug: 'saint-germain-des-pres-paris',
    neighborhoodName_fr: 'Saint-Germain-des-Prés',
    neighborhoodName_en: 'Saint-Germain-des-Prés',
    mediaUrls: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ],
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-19T16:45:00Z',
  },
  {
    id: '4',
    userId: 'mock-user-4',
    status: PropertyStatus.LISTED,
    title_fr: 'Terrain Constructible - Vue Mer',
    title_en: 'Buildable Land - Sea View',
    description_fr: 'Superbe terrain constructible de 1200m² avec vue imprenable sur la Méditerranée. Viabilisé, constructible immédiatement.',
    description_en: 'Beautiful 1200m² buildable land with stunning Mediterranean views. Serviced, ready to build immediately.',
    type: PropertyType.LAND,
    price: 320000,
    currency: 'EUR',
    latitude: 43.7102,
    longitude: 7.2620,
    street: 'Promenade des Anglais',
    postalCode: '06000',
    city: 'Nice',
    region: "Provence-Alpes-Côte d'Azur",
    country: 'France',
    neighborhoodSlug: 'promenade-angles-nice',
    neighborhoodName_fr: 'Promenade des Anglais',
    neighborhoodName_en: 'Promenade des Anglais',
    mediaUrls: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    ],
    createdAt: '2024-01-08T08:00:00Z',
    updatedAt: '2024-01-15T10:15:00Z',
  },
  {
    id: '5',
    userId: 'mock-user-5',
    status: PropertyStatus.LISTED,
    title_fr: 'Local Commercial - Zone Pédestre',
    title_en: 'Commercial Space - Pedestrian Zone',
    description_fr: 'Local commercial de 120m² idéal pour commerce de détail, restaurant ou boutique. Situé dans une zone piétonne très fréquentée.',
    description_en: '120m² commercial space ideal for retail, restaurant or boutique. Located in a busy pedestrian zone.',
    type: PropertyType.COMMERCIAL,
    price: 780000,
    currency: 'EUR',
    latitude: 48.8566,
    longitude: 2.3522,
    street: 'Rue du Faubourg Saint-Antoine',
    postalCode: '75011',
    city: 'Paris',
    region: 'Île-de-France',
    country: 'France',
    neighborhoodSlug: 'le-marais-paris',
    neighborhoodName_fr: 'Le Marais',
    neighborhoodName_en: 'Le Marais',
    mediaUrls: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    ],
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-12T13:30:00Z',
  },
  {
    id: '6',
    userId: 'mock-user-6',
    status: PropertyStatus.LISTED,
    title_fr: 'Villa de Luxe - Proche Plage',
    title_en: 'Luxury Villa - Near Beach',
    description_fr: 'Prestigieuse villa de 400m² avec vue mer, piscine chauffée, spa et dépendances. 6 chambres, 4 salles de bain, home cinema.',
    description_en: 'Prestigious 400m² villa with sea view, heated pool, spa and outbuildings. 6 bedrooms, 4 bathrooms, home cinema.',
    type: PropertyType.VILLA,
    price: 2500000,
    currency: 'EUR',
    latitude: 43.5528,
    longitude: 7.0174,
    street: 'Boulevard de la Croisette',
    postalCode: '06400',
    city: 'Cannes',
    region: "Provence-Alpes-Côte d'Azur",
    country: 'France',
    neighborhoodSlug: 'promenade-angles-nice',
    neighborhoodName_fr: 'La Croisette',
    neighborhoodName_en: 'La Croisette',
    mediaUrls: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800',
    ],
    createdAt: '2024-01-03T09:00:00Z',
    updatedAt: '2024-01-10T15:00:00Z',
  },
  {
    id: '7',
    userId: 'mock-user-7',
    status: PropertyStatus.LISTED,
    title_fr: 'Studio Cosy - Proche Métro',
    title_en: 'Cozy Studio - Near Metro',
    description_fr: 'Studio rénové de 25m², idéal pour étudiant ou jeune actif. Bien situé, proche ligne 1 du métro. Récemment rénové.',
    description_en: 'Renovated 25m² studio, ideal for students or young professionals. Well located, close to metro line 1. Recently renovated.',
    type: PropertyType.APARTMENT,
    price: 180000,
    currency: 'EUR',
    latitude: 48.8630,
    longitude: 2.3444,
    street: 'Rue de la Sorbonne',
    postalCode: '75005',
    city: 'Paris',
    region: 'Île-de-France',
    country: 'France',
    neighborhoodSlug: 'saint-germain-des-pres-paris',
    neighborhoodName_fr: 'Saint-Germain-des-Prés',
    neighborhoodName_en: 'Saint-Germain-des-Prés',
    mediaUrls: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    ],
    createdAt: '2024-01-14T10:30:00Z',
    updatedAt: '2024-01-21T09:15:00Z',
  },
  {
    id: '8',
    userId: 'mock-user-8',
    status: PropertyStatus.LISTED,
    title_fr: 'Maison avec Piscine - Provence',
    title_en: 'House with Pool - Provence',
    description_fr: 'Belle maison provençale de 200m² avec piscine, terrasse et jardin paysager. 5 chambres, piscine chauffée, garage double.',
    description_en: 'Beautiful 200m² Provencal house with pool, terrace and landscaped garden. 5 bedrooms, heated pool, double garage.',
    type: PropertyType.HOUSE,
    price: 980000,
    currency: 'EUR',
    latitude: 43.9481,
    longitude: 4.8084,
    street: 'Rue de la République',
    postalCode: '84000',
    city: 'Avignon',
    region: "Provence-Alpes-Côte d'Azur",
    country: 'France',
    mediaUrls: [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    ],
    createdAt: '2024-01-11T13:00:00Z',
    updatedAt: '2024-01-17T11:30:00Z',
  },
];

export const mockSuggestions = [
  { title: 'Villa Paris', city: 'Paris', type: 'property' },
  { title: 'Appartement Lyon', city: 'Lyon', type: 'property' },
  { title: 'Maison Marseille', city: 'Marseille', type: 'property' },
  { title: 'Terrain Nice', city: 'Nice', type: 'property' },
  { title: 'Local Commercial Paris', city: 'Paris', type: 'property' },
];

/**
 * Simulates a search API call with mock data
 */
export function mockSearch(
  query: string = '',
  filters: any = {},
  options: any = {}
): Promise<SearchResult> {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      let filteredProperties = [...mockProperties];

      // Filter by query
      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredProperties = filteredProperties.filter(
          (p) =>
            p.title_fr?.toLowerCase().includes(lowerQuery) ||
            p.title_en?.toLowerCase().includes(lowerQuery) ||
            p.description_fr?.toLowerCase().includes(lowerQuery) ||
            p.description_en?.toLowerCase().includes(lowerQuery) ||
            p.city?.toLowerCase().includes(lowerQuery) ||
            p.country?.toLowerCase().includes(lowerQuery)
        );
      }

      // Filter by type
      if (filters.type) {
        filteredProperties = filteredProperties.filter((p) => p.type === filters.type);
      }

      // Filter by country
      if (filters.country) {
        filteredProperties = filteredProperties.filter((p) =>
          p.country?.toLowerCase().includes(filters.country.toLowerCase())
        );
      }

      // Filter by city
      if (filters.city) {
        filteredProperties = filteredProperties.filter((p) =>
          p.city?.toLowerCase().includes(filters.city.toLowerCase())
        );
      }

      // Filter by price range
      if (filters.minPrice) {
        filteredProperties = filteredProperties.filter((p) => p.price >= filters.minPrice);
      }
      if (filters.maxPrice) {
        filteredProperties = filteredProperties.filter((p) => p.price <= filters.maxPrice);
      }

      // Filter by location (within radius)
      if (filters.latitude && filters.longitude && filters.radiusKm) {
        filteredProperties = filteredProperties.filter((p) => {
          if (!p.latitude || !p.longitude) return false;
          const distance = calculateDistance(
            filters.latitude,
            filters.longitude,
            p.latitude,
            p.longitude
          );
          return distance <= filters.radiusKm;
        });
      }

      // Filter by bounds (drawn rectangle on map) - if provided, use bounds instead of radius
      // Note: Bounds take priority over radius if both are provided
      if (filters.northEastLat && filters.northEastLng && filters.southWestLat && filters.southWestLng) {
        filteredProperties = filteredProperties.filter((p) => {
          if (!p.latitude || !p.longitude) return false;
          // Check if property is within bounding box
          return (
            p.latitude >= filters.southWestLat! &&
            p.latitude <= filters.northEastLat! &&
            p.longitude >= filters.southWestLng! &&
            p.longitude <= filters.northEastLng!
          );
        });
      }

      // Sort results
      const sortParam = options.sortBy || options.sort?.[0] || 'relevance';
      const sortBy = typeof sortParam === 'string' ? sortParam : sortParam?.replace('price:', '').replace('distance:', '') || 'relevance';
      if (sortBy === 'price_asc') {
        filteredProperties.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        filteredProperties.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'distance' && filters.latitude && filters.longitude) {
        filteredProperties.sort((a, b) => {
          if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0;
          const distA = calculateDistance(filters.latitude, filters.longitude, a.latitude, a.longitude);
          const distB = calculateDistance(filters.latitude, filters.longitude, b.latitude, b.longitude);
          return distA - distB;
        });
      }

      // Pagination
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      const paginatedProperties = filteredProperties.slice(offset, offset + limit);

      // Calculate processing time (simulated)
      const processingTimeMs = Math.floor(Math.random() * 100) + 50;

      resolve({
        hits: paginatedProperties,
        totalHits: filteredProperties.length,
        limit,
        offset,
        processingTimeMs,
        query: query || undefined,
      });
    }, 300 + Math.random() * 200); // Simulate 300-500ms response time
  });
}

/**
 * Simulates autocomplete suggestions
 */
export function mockSuggestionsCall(query: string): Promise<any[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (query.length < 2) {
        resolve([]);
        return;
      }

      const lowerQuery = query.toLowerCase();
      const suggestions = mockSuggestions.filter((s) =>
        s.title.toLowerCase().includes(lowerQuery) || s.city.toLowerCase().includes(lowerQuery)
      );

      resolve(suggestions.slice(0, 5)); // Max 5 suggestions
    }, 150 + Math.random() * 100); // Simulate 150-250ms response time
  });
}

/**
 * Calculate distance between two coordinates in kilometers (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

