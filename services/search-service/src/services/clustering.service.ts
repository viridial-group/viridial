import { Injectable, Logger } from '@nestjs/common';
import { PropertyDocument } from './meilisearch.service';

export interface ClusterPoint {
  lat: number;
  lng: number;
  count: number;
  properties?: PropertyDocument[]; // Included if count <= threshold
}

@Injectable()
export class ClusteringService {
  private readonly logger = new Logger(ClusteringService.name);

  /**
   * Cluster properties by geographic proximity for map display
   * Uses grid-based clustering algorithm optimized for performance
   *
   * @param properties - Properties with lat/lng coordinates
   * @param zoom - Map zoom level (determines grid size)
   * @param maxClusters - Maximum number of clusters to return
   * @param includePropertiesThreshold - Include properties array if count <= this
   */
  clusterProperties(
    properties: PropertyDocument[],
    zoom: number,
    maxClusters: number = 100,
    includePropertiesThreshold: number = 5,
  ): ClusterPoint[] {
    if (!properties || properties.length === 0) {
      return [];
    }

    // Filter properties with valid coordinates
    const validProperties = properties.filter(
      (prop) =>
        prop.latitude != null &&
        prop.longitude != null &&
        !isNaN(prop.latitude) &&
        !isNaN(prop.longitude),
    );

    if (validProperties.length === 0) {
      return [];
    }

    // Calculate grid size based on zoom level
    // Higher zoom = smaller grid cells (more detail)
    const gridSize = this.calculateGridSize(zoom);

    // Group properties by grid cell
    const clusters = new Map<string, PropertyDocument[]>();

    validProperties.forEach((prop) => {
      const gridKey = this.getGridKey(
        prop.latitude!,
        prop.longitude!,
        gridSize,
      );
      if (!clusters.has(gridKey)) {
        clusters.set(gridKey, []);
      }
      clusters.get(gridKey)!.push(prop);
    });

    // Convert to cluster points
    const clusterPoints: ClusterPoint[] = Array.from(clusters.entries()).map(
      ([key, props]) => {
        const [lat, lng] = key.split(',').map(Number);

        // Calculate centroid (average of all properties in cluster)
        const avgLat =
          props.reduce((sum, p) => sum + (p.latitude || 0), 0) / props.length;
        const avgLng =
          props.reduce((sum, p) => sum + (p.longitude || 0), 0) / props.length;

        return {
          lat: avgLat,
          lng: avgLng,
          count: props.length,
          properties:
            props.length <= includePropertiesThreshold ? props : undefined,
        };
      },
    );

    // Sort by count (descending) and limit
    clusterPoints.sort((a, b) => b.count - a.count);

    // If we have too many clusters, merge smallest ones
    if (clusterPoints.length > maxClusters) {
      return this.mergeClusters(clusterPoints, maxClusters);
    }

    return clusterPoints;
  }

  /**
   * Calculate grid size based on zoom level
   * Grid size decreases as zoom increases (more detail at higher zoom)
   */
  private calculateGridSize(zoom: number): number {
    // Clamp zoom between 1 and 20
    const clampedZoom = Math.max(1, Math.min(20, zoom));

    // Grid size formula: larger at low zoom, smaller at high zoom
    // At zoom 1: ~1 degree (very large cells)
    // At zoom 10: ~0.01 degree (small cells)
    // At zoom 20: ~0.0001 degree (very small cells)
    return Math.max(0.0001, 1 / Math.pow(2, clampedZoom - 1));
  }

  /**
   * Get grid cell key for a coordinate
   */
  private getGridKey(lat: number, lng: number, gridSize: number): string {
    const gridLat = Math.floor(lat / gridSize) * gridSize;
    const gridLng = Math.floor(lng / gridSize) * gridSize;
    return `${gridLat},${gridLng}`;
  }

  /**
   * Merge smallest clusters to reduce total count
   */
  private mergeClusters(
    clusters: ClusterPoint[],
    maxClusters: number,
  ): ClusterPoint[] {
    // Keep largest clusters
    const keepClusters = clusters.slice(0, maxClusters - 1);
    const mergeClusters = clusters.slice(maxClusters - 1);

    if (mergeClusters.length === 0) {
      return keepClusters;
    }

    // Merge remaining clusters into a single "other" cluster
    const totalMerged = mergeClusters.reduce((sum, c) => sum + c.count, 0);
    const avgLat =
      mergeClusters.reduce((sum, c) => sum + c.lat * c.count, 0) / totalMerged;
    const avgLng =
      mergeClusters.reduce((sum, c) => sum + c.lng * c.count, 0) / totalMerged;

    const mergedCluster: ClusterPoint = {
      lat: avgLat,
      lng: avgLng,
      count: totalMerged,
      properties: undefined, // Don't include properties for merged cluster
    };

    return [...keepClusters, mergedCluster];
  }

  /**
   * Get clusters for a bounding box area
   * Optimized for map viewport queries
   */
  async getClustersForBbox(
    properties: PropertyDocument[],
    bbox: { minLat: number; minLon: number; maxLat: number; maxLon: number },
    zoom: number,
    limit: number = 100,
  ): Promise<ClusterPoint[]> {
    // Filter properties within bounding box
    const filteredProperties = properties.filter(
      (prop) =>
        prop.latitude != null &&
        prop.longitude != null &&
        prop.latitude >= bbox.minLat &&
        prop.latitude <= bbox.maxLat &&
        prop.longitude >= bbox.minLon &&
        prop.longitude <= bbox.maxLon,
    );

    return this.clusterProperties(filteredProperties, zoom, limit);
  }
}

