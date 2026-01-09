/**
 * DTO for property statistics response
 */
export interface PropertyStatisticsDto {
  total: number;
  byStatus: {
    draft: number;
    review: number;
    listed: number;
    flagged: number;
    archived: number;
  };
  byType: {
    house: number;
    apartment: number;
    villa: number;
    land: number;
    commercial: number;
    other: number;
  };
  byCountry: Array<{
    country: string;
    count: number;
  }>;
  byCity: Array<{
    city: string;
    country: string;
    count: number;
  }>;
  priceRange: {
    min: number;
    max: number;
    average: number;
    median: number;
  };
  currencyDistribution: Array<{
    currency: string;
    count: number;
  }>;
  recentlyPublished: number; // Count of properties published in last 7 days
  recentlyCreated: number; // Count of properties created in last 7 days
  withImages: number; // Count of properties with at least one image
  withCoordinates: number; // Count of properties with geolocation
}

