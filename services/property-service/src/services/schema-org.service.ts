import { Injectable } from '@nestjs/common';
import { Property } from '../entities/property.entity';
import { PropertyTranslation } from '../entities/property-translation.entity';

@Injectable()
export class SchemaOrgService {
  /**
   * Generate Schema.org JSON-LD for a property listing
   * Follows RealEstateAgent schema with Offer
   */
  generateSchemaOrg(
    property: Property,
    translations: PropertyTranslation[],
  ): object {
    // Get default translation (prefer French, fallback to first available)
    const defaultTranslation =
      translations.find((t) => t.language === 'fr') || translations[0];

    if (!defaultTranslation) {
      throw new Error('No translation available for property');
    }

    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: defaultTranslation.title,
      description: defaultTranslation.description || defaultTranslation.title,
    };

    // Address
    if (
      property.street ||
      property.city ||
      property.postalCode ||
      property.country
    ) {
      schema.address = {
        '@type': 'PostalAddress',
      };

      if (property.street) {
        schema.address.streetAddress = property.street;
      }
      if (property.city) {
        schema.address.addressLocality = property.city;
      }
      if (property.postalCode) {
        schema.address.postalCode = property.postalCode;
      }
      if (property.region) {
        schema.address.addressRegion = property.region;
      }
      if (property.country) {
        schema.address.addressCountry = property.country;
      }
    }

    // Geo coordinates
    if (property.latitude && property.longitude) {
      schema.geo = {
        '@type': 'GeoCoordinates',
        latitude: property.latitude.toString(),
        longitude: property.longitude.toString(),
      };
    }

    // Offer (price)
    schema.offers = {
      '@type': 'Offer',
      price: property.price.toString(),
      priceCurrency: property.currency || 'EUR',
      availability: 'https://schema.org/InStock', // Property is available
      url: `https://viridial.com/properties/${property.id}`, // TODO: Use actual domain from config
    };

    // Images
    if (property.mediaUrls && property.mediaUrls.length > 0) {
      schema.image = property.mediaUrls;
    }

    // Property type mapping
    const propertyTypeMap: Record<string, string> = {
      house: 'House',
      apartment: 'Apartment',
      villa: 'Villa',
      land: 'Land',
      commercial: 'CommercialProperty',
      other: 'RealEstateListing',
    };

    schema.itemOffered = {
      '@type': propertyTypeMap[property.type] || 'RealEstateListing',
    };

    // Additional metadata
    schema.datePosted = property.publishedAt
      ? property.publishedAt.toISOString()
      : property.createdAt.toISOString();

    // Organization/Agent (if available)
    // TODO: Add organization/agent info when available
    // schema.offers.seller = {
    //   '@type': 'RealEstateAgent',
    //   name: '...',
    // };

    return schema;
  }
}

