import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { In, IsNull } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { OrganizationAddress } from '../entities/organization-address.entity';
import { OrganizationPhone } from '../entities/organization-phone.entity';
import { OrganizationEmail } from '../entities/organization-email.entity';
import { Subscription } from '../entities/subscription.entity';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { FilterOrganizationDto, SortField } from '../dto/filter-organization.dto';
import {
  BulkDeleteOrganizationsDto,
  BulkUpdateOrganizationsDto,
  ChangeParentDto,
} from '../dto/bulk-organization.dto';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    @InjectRepository(Organization)
    // NOTE: typage assoupli ici car les types TypeORM ne sont pas résolus correctement
    private organizationRepo: any,
    @InjectRepository(OrganizationAddress)
    private addressRepo: any,
    @InjectRepository(OrganizationPhone)
    private phoneRepo: any,
    @InjectRepository(OrganizationEmail)
    private emailRepo: any,
    @InjectRepository(Subscription)
    private subscriptionRepo: any,
    @InjectDataSource()
    // NOTE: typage assoupli ici car les types TypeORM ne sont pas résolus correctement
    private readonly dataSource: any,
  ) {}

  /**
   * Create a new organization with optimized query
   */
  async create(dto: CreateOrganizationDto, userId?: string): Promise<Organization> {
    // Check if slug already exists
    const existing = await this.organizationRepo.findOne({
      where: { slug: dto.slug },
      select: ['id'],
    });

    if (existing) {
      throw new ConflictException(`Organization with slug "${dto.slug}" already exists`);
    }

    // Validate parent exists if provided
    if (dto.parentId) {
      const parent = await this.organizationRepo.findOne({
        where: { id: dto.parentId },
        select: ['id'],
      });
      if (!parent) {
        throw new NotFoundException(`Parent organization with id "${dto.parentId}" not found`);
      }
    }

    // Create organization entity
    const organization = this.organizationRepo.create({
      ...dto,
      parentId: dto.parentId || null,
      createdBy: userId,
      foundingDate: dto.foundingDate ? new Date(dto.foundingDate) : undefined,
      contractStartDate: dto.contractStartDate ? new Date(dto.contractStartDate) : undefined,
      contractEndDate: dto.contractEndDate ? new Date(dto.contractEndDate) : undefined,
      contractRenewalDate: dto.contractRenewalDate ? new Date(dto.contractRenewalDate) : undefined,
      licenseExpiryDate: dto.licenseExpiryDate ? new Date(dto.licenseExpiryDate) : undefined,
      lastComplianceCheck: dto.lastComplianceCheck ? new Date(dto.lastComplianceCheck) : undefined,
    });

    // Save organization first
    const savedOrg = await this.organizationRepo.save(organization);

    // Save addresses, phones, emails in parallel
    const promises: Promise<any>[] = [];

    if (dto.addresses && dto.addresses.length > 0) {
      const addresses = dto.addresses.map((addr) =>
        this.addressRepo.create({
          ...addr,
          organizationId: savedOrg.id,
        }),
      );
      promises.push(this.addressRepo.save(addresses));
    }

    if (dto.phones && dto.phones.length > 0) {
      const phones = dto.phones.map((phone) =>
        this.phoneRepo.create({
          ...phone,
          organizationId: savedOrg.id,
        }),
      );
      promises.push(this.phoneRepo.save(phones));
    }

    if (dto.emails && dto.emails.length > 0) {
      const emails = dto.emails.map((email) =>
        this.emailRepo.create({
          ...email,
          organizationId: savedOrg.id,
        }),
      );
      promises.push(this.emailRepo.save(emails));
    }

    await Promise.all(promises);

    // Return organization with relations
    return this.findById(savedOrg.id);
  }

  /**
   * Find all organizations with filters, sorting, and pagination (optimized)
   */
  async findAll(filterDto: FilterOrganizationDto): Promise<{
    organizations: Organization[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      search,
      plan,
      isActive,
      country,
      city,
      parentId,
      minUsers,
      maxUsers,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    // Use QueryBuilder for optimized queries with minimal joins
    // Load parent only (lazy) for display, user counts will be calculated separately
    const queryBuilder = this.organizationRepo.createQueryBuilder('org');

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(org.name ILIKE :search OR org.description ILIKE :search OR org.internalCode ILIKE :search OR org.externalCode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (plan) {
      queryBuilder.andWhere('org.plan = :plan', { plan });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('org.isActive = :isActive', { isActive });
    }

    if (country) {
      queryBuilder.andWhere('org.country = :country', { country });
    }

    if (city) {
      queryBuilder.andWhere('org.city = :city', { city });
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        queryBuilder.andWhere('org.parentId IS NULL');
      } else {
        queryBuilder.andWhere('org.parentId = :parentId', { parentId });
      }
    }

    // User count filters (using subquery for performance)
    // Note: This assumes users table exists in same database
    // In microservices architecture, you might need to call user-service API instead
    if (minUsers !== undefined || maxUsers !== undefined) {
      // For now, we'll skip this filter as it requires cross-service query
      // This should be handled via API gateway or service mesh in production
      // TODO: Implement user count filtering via user-service API call or shared database view
    }

    // Handle sorting by userCount (requires subquery before pagination)
    if (sortBy === 'userCount') {
      try {
        // Add subquery for userCount sorting (only if sorting by userCount)
        queryBuilder
          .addSelect(
            (subQuery: any) =>
              subQuery
                .select('COUNT(*)')
                .from('users', 'u')
                .where('u.organization_id = org.id'),
            'userCountForSort',
          )
          .orderBy('userCountForSort', sortOrder);
      } catch (error) {
        // Fallback to createdAt if user count subquery fails
        this.logger.warn('Could not sort by userCount (users table may not exist), falling back to createdAt', error);
        queryBuilder.orderBy('org.createdAt', sortOrder);
      }
    } else {
      // Apply standard sorting for other fields
      const sortFieldMap: Record<SortField, string> = {
        name: 'org.name',
        createdAt: 'org.createdAt',
        updatedAt: 'org.updatedAt',
        plan: 'org.plan',
        isActive: 'org.isActive',
        country: 'org.country',
        city: 'org.city',
        userCount: 'org.createdAt', // Fallback (should not be used here)
      };

      const orderBy = sortFieldMap[sortBy] || 'org.createdAt';
      queryBuilder.orderBy(orderBy, sortOrder);
    }

    // Clone query builder for count (before applying pagination)
    const countQueryBuilder = queryBuilder.clone();

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute queries in parallel: count and data
    const [organizations, total] = await Promise.all([
      queryBuilder.getMany(),
      countQueryBuilder.getCount(),
    ]);

    // Load user counts for paginated organizations in a single batch query (optimized - no N+1 queries)
    const orgIds = organizations.map((org: Organization) => org.id);
    const userCountsMap = new Map<string, { userCount: number; activeUserCount: number }>();

    if (orgIds.length > 0) {
      try {
        // Single optimized query to get all user counts at once (GROUP BY with conditional aggregation)
        const userCountsRaw = await this.dataSource
          .createQueryBuilder()
          .select('u.organization_id', 'organizationId')
          .addSelect('COUNT(*)', 'totalCount')
          .addSelect('COUNT(CASE WHEN u.is_active = true THEN 1 END)', 'activeCount')
          .from('users', 'u')
          .where('u.organization_id IN (:...orgIds)', { orgIds })
          .groupBy('u.organization_id')
          .getRawMany();

        // Build map for O(1) lookup
        userCountsRaw.forEach((row: { organizationId: string; totalCount?: string; activeCount?: string }) => {
          userCountsMap.set(row.organizationId, {
            userCount: parseInt(row.totalCount || '0', 10),
            activeUserCount: parseInt(row.activeCount || '0', 10),
          });
        });
      } catch (error) {
        // Fallback: users table might not exist in this service (microservices architecture)
        // This is expected in microservices where users are managed by a separate service
        this.logger.debug('Could not load user counts (users table may not exist in this service)', error);
      }
    }

    // Map user counts to organizations (O(1) lookup - no N+1 queries)
    const organizationsWithStats = organizations.map((org: Organization) => {
      const counts = userCountsMap.get(org.id) || { userCount: 0, activeUserCount: 0 };
      return {
        ...org,
        userCount: counts.userCount,
        activeUserCount: counts.activeUserCount,
      } as Organization & { userCount: number; activeUserCount: number };
    });

    return {
      organizations: organizationsWithStats,
      total,
      page,
      limit,
    };
  }

  /**
   * Find organization by ID with optimized eager loading
   */
  async findById(id: string): Promise<Organization> {
    const organization = await this.organizationRepo.findOne({
      where: { id },
      relations: ['parent', 'addresses', 'phones', 'emails'],
      loadRelationIds: {
        relations: ['children'],
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with id "${id}" not found`);
    }

    // Load subscriptions with plans
    const subscriptions = await this.subscriptionRepo.find({
      where: { organizationId: id },
      relations: ['plan', 'plan.features', 'plan.limits'],
      order: { createdAt: 'DESC' },
    });
    (organization as any).subscriptions = subscriptions;

    // Load user count separately for performance
    // Note: In microservices, this should call user-service API
    const [userCount, activeUserCount] = await Promise.all([
      this.dataSource
        .createQueryBuilder()
        .select('COUNT(*)', 'count')
        .from('users', 'u')
        .where('u.organization_id = :orgId', { orgId: id })
        .getRawOne()
        .then((r: { count?: string } | undefined) => parseInt(r?.count || '0', 10))
        .catch(() => 0), // Fallback if users table doesn't exist
      this.dataSource
        .createQueryBuilder()
        .select('COUNT(*)', 'count')
        .from('users', 'u')
        .where('u.organization_id = :orgId', { orgId: id })
        .andWhere('u.is_active = :isActive', { isActive: true })
        .getRawOne()
        .then((r: { count?: string } | undefined) => parseInt(r?.count || '0', 10))
        .catch(() => 0), // Fallback if users table doesn't exist
    ]);

    (organization as any).userCount = userCount;
    (organization as any).activeUserCount = activeUserCount;

    return organization;
  }

  /**
   * Get statistics for organizations (optimized with parallel queries)
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byPlan: Record<string, number>;
    byCountry: Record<string, number>;
    totalUsers: number;
  }> {
    // Execute all queries in parallel for optimal performance
    const [total, active, inactive, byPlanRaw, byCountryRaw, totalUsersRaw] = await Promise.all([
      this.organizationRepo.count(),
      this.organizationRepo.count({ where: { isActive: true } }),
      this.organizationRepo.count({ where: { isActive: false } }),
      this.organizationRepo
        .createQueryBuilder('org')
        .select('org.plan', 'plan')
        .addSelect('COUNT(*)', 'count')
        .groupBy('org.plan')
        .getRawMany(),
      this.organizationRepo
        .createQueryBuilder('org')
        .select('org.country', 'country')
        .addSelect('COUNT(*)', 'count')
        .where('org.country IS NOT NULL')
        .groupBy('org.country')
        .getRawMany(),
      this.dataSource
        .createQueryBuilder()
        .select('COUNT(DISTINCT u.id)', 'count')
        .from('users', 'u')
        .where('u.organization_id IS NOT NULL')
        .getRawOne()
        .then((r: { count?: string } | undefined) => parseInt(r?.count || '0', 10))
        .catch(() => 0), // Fallback if users table doesn't exist
    ]);

    // Transform results
    const byPlan: Record<string, number> = {};
    byPlanRaw.forEach((row: { plan?: string; count?: string }) => {
      byPlan[row.plan || 'unknown'] = parseInt(row.count || '0', 10);
    });

    const byCountry: Record<string, number> = {};
    byCountryRaw.forEach((row: { country: string; count?: string }) => {
      byCountry[row.country] = parseInt(row.count || '0', 10);
    });

    return {
      total,
      active,
      inactive,
      byPlan,
      byCountry,
      totalUsers: typeof totalUsersRaw === 'number' ? totalUsersRaw : 0,
    };
  }

  /**
   * Update organization (optimized)
   */
  async update(id: string, dto: UpdateOrganizationDto, userId?: string): Promise<Organization> {
    const organization = await this.organizationRepo.findOne({ where: { id } });

    if (!organization) {
      throw new NotFoundException(`Organization with id "${id}" not found`);
    }

    // Validate parent if being changed
    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        // Removing parent - validate no circular reference
        // (already validated by checking parentId is different from id)
      } else if (dto.parentId === id) {
        throw new BadRequestException('Organization cannot be its own parent');
      } else {
        // Check parent exists
        const parent = await this.organizationRepo.findOne({
          where: { id: dto.parentId },
          select: ['id'],
        });
        if (!parent) {
          throw new NotFoundException(`Parent organization with id "${dto.parentId}" not found`);
        }

        // Check for circular reference (parent cannot be a descendant)
        const isDescendant = await this.isDescendant(dto.parentId, id);
        if (isDescendant) {
          throw new BadRequestException('Cannot set parent: would create circular reference');
        }
      }
    }

    // Update organization fields
    // Use type assertion to handle PartialType inference issues
    const dtoTyped = dto as Partial<CreateOrganizationDto>;
    const updates: Partial<Organization> = {
      updatedBy: userId,
    };

    // Copy all non-date fields from DTO
    Object.keys(dtoTyped).forEach((key) => {
      const value = (dtoTyped as any)[key];
      // Skip date fields, addresses, phones, emails - handled separately
      if (
        !['foundingDate', 'contractStartDate', 'contractEndDate', 'contractRenewalDate', 'licenseExpiryDate', 'lastComplianceCheck', 'addresses', 'phones', 'emails'].includes(key)
      ) {
        (updates as any)[key] = value;
      }
    });

    // Handle date fields (only update if provided)
    if (dtoTyped.foundingDate !== undefined) {
      updates.foundingDate = dtoTyped.foundingDate ? new Date(dtoTyped.foundingDate) : undefined;
    }
    if (dtoTyped.contractStartDate !== undefined) {
      updates.contractStartDate = dtoTyped.contractStartDate ? new Date(dtoTyped.contractStartDate) : undefined;
    }
    if (dtoTyped.contractEndDate !== undefined) {
      updates.contractEndDate = dtoTyped.contractEndDate ? new Date(dtoTyped.contractEndDate) : undefined;
    }
    if (dtoTyped.contractRenewalDate !== undefined) {
      updates.contractRenewalDate = dtoTyped.contractRenewalDate ? new Date(dtoTyped.contractRenewalDate) : undefined;
    }
    if (dtoTyped.licenseExpiryDate !== undefined) {
      updates.licenseExpiryDate = dtoTyped.licenseExpiryDate ? new Date(dtoTyped.licenseExpiryDate) : undefined;
    }
    if (dtoTyped.lastComplianceCheck !== undefined) {
      updates.lastComplianceCheck = dtoTyped.lastComplianceCheck ? new Date(dtoTyped.lastComplianceCheck) : undefined;
    }

    Object.assign(organization, updates);

    // Update addresses, phones, emails if provided
    if (dtoTyped.addresses !== undefined) {
      // Delete existing and create new (simpler than diffing)
      await this.addressRepo.delete({ organizationId: id });
      if (dtoTyped.addresses && dtoTyped.addresses.length > 0) {
        const addresses = dtoTyped.addresses.map((addr) =>
          this.addressRepo.create({
            ...addr,
            organizationId: id,
          }),
        );
        await this.addressRepo.save(addresses);
      }
    }

    if (dtoTyped.phones !== undefined) {
      await this.phoneRepo.delete({ organizationId: id });
      if (dtoTyped.phones && dtoTyped.phones.length > 0) {
        const phones = dtoTyped.phones.map((phone) =>
          this.phoneRepo.create({
            ...phone,
            organizationId: id,
          }),
        );
        await this.phoneRepo.save(phones);
      }
    }

    if (dtoTyped.emails !== undefined) {
      await this.emailRepo.delete({ organizationId: id });
      if (dtoTyped.emails && dtoTyped.emails.length > 0) {
        const emails = dtoTyped.emails.map((email) =>
          this.emailRepo.create({
            ...email,
            organizationId: id,
          }),
        );
        await this.emailRepo.save(emails);
      }
    }

    await this.organizationRepo.save(organization);

    return this.findById(id);
  }

  /**
   * Delete organization (with cascading logic for children)
   */
  async delete(id: string): Promise<void> {
    const organization = await this.organizationRepo.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!organization) {
      throw new NotFoundException(`Organization with id "${id}" not found`);
    }

    // Handle children: move them to parent's parent or make root
    if (organization.children && organization.children.length > 0) {
      const newParentId = organization.parentId || null;

      await this.organizationRepo.update(
        { parentId: id },
        { parentId: newParentId },
      );
    }

    // Delete organization (cascade will handle addresses, phones, emails)
    await this.organizationRepo.remove(organization);
  }

  /**
   * Bulk delete organizations (optimized)
   */
  async bulkDelete(dto: BulkDeleteOrganizationsDto): Promise<{
    deleted: number;
    errors: Array<{ id: string; error: string }>;
  }> {
    const { organizationIds } = dto;
    const errors: Array<{ id: string; error: string }> = [];
    let deleted = 0;

    // Process in batches for better performance
    const batchSize = 50;
    for (let i = 0; i < organizationIds.length; i += batchSize) {
      const batch = organizationIds.slice(i, i + batchSize);

      await Promise.allSettled(
        batch.map(async (id) => {
          try {
            await this.delete(id);
            deleted++;
          } catch (error: any) {
            errors.push({
              id,
              error: error.message || 'Unknown error',
            });
          }
        }),
      );
    }

    return { deleted, errors };
  }

  /**
   * Bulk update organizations (optimized)
   */
  async bulkUpdate(dto: BulkUpdateOrganizationsDto): Promise<{
    updated: number;
    errors: Array<{ id: string; error: string }>;
  }> {
    const { organizationIds, ...updateData } = dto;
    const errors: Array<{ id: string; error: string }> = [];
    let updated = 0;

    // Validate parent if being changed
    if (updateData.parentId !== undefined) {
      for (const id of organizationIds) {
        if (updateData.parentId === id) {
          errors.push({
            id,
            error: 'Organization cannot be its own parent',
          });
          continue;
        }

        if (updateData.parentId !== null) {
          const isDescendant = await this.isDescendant(updateData.parentId, id);
          if (isDescendant) {
            errors.push({
              id,
              error: 'Cannot set parent: would create circular reference',
            });
            continue;
          }
        }
      }
    }

    // Filter out organizations with errors
    const validIds = organizationIds.filter(
      (id) => !errors.some((e) => e.id === id),
    );

    if (validIds.length > 0) {
      // Use single update query for better performance
      await this.organizationRepo.update(
        { id: In(validIds) },
        {
          ...updateData,
          updatedAt: new Date(),
        },
      );

      updated = validIds.length;
    }

    return { updated, errors };
  }

  /**
   * Change parent for multiple organizations
   */
  async changeParent(dto: ChangeParentDto): Promise<{
    updated: number;
    errors: Array<{ id: string; error: string }>;
  }> {
    const { organizationIds, newParentId } = dto;
    const errors: Array<{ id: string; error: string }> = [];

    // Validate new parent exists if provided
    if (newParentId !== null && newParentId !== undefined) {
      const parent = await this.organizationRepo.findOne({
        where: { id: newParentId },
        select: ['id'],
      });
      if (!parent) {
        throw new NotFoundException(`Parent organization with id "${newParentId}" not found`);
      }
    }

    // Validate no circular references
    for (const id of organizationIds) {
      if (newParentId === id) {
        errors.push({
          id,
          error: 'Organization cannot be its own parent',
        });
        continue;
      }

      if (newParentId !== null && newParentId !== undefined) {
        const isDescendant = await this.isDescendant(newParentId, id);
        if (isDescendant) {
          errors.push({
            id,
            error: 'Cannot set parent: would create circular reference',
          });
        }
      }
    }

    // Filter out organizations with errors
    const validIds = organizationIds.filter(
      (id) => !errors.some((e) => e.id === id),
    );

    let updated = 0;
    if (validIds.length > 0) {
      // Use single update query for better performance
      await this.organizationRepo.update(
        { id: In(validIds) },
        {
          parentId: newParentId || null,
          updatedAt: new Date(),
        },
      );

      updated = validIds.length;
    }

    return { updated, errors };
  }

  /**
   * Get all sub-organizations (descendants) of an organization
   * Uses recursive query for efficient tree traversal
   */
  async getSubOrganizations(parentId: string): Promise<Organization[]> {
    // Validate parent exists
    const parent = await this.organizationRepo.findOne({
      where: { id: parentId },
      select: ['id'],
    });

    if (!parent) {
      throw new NotFoundException(`Organization with id "${parentId}" not found`);
    }

    // Use recursive CTE for efficient tree traversal (PostgreSQL)
    const result = await this.dataSource.query(
      `
      WITH RECURSIVE descendants AS (
        SELECT id, name, parent_id, created_at, slug, plan, is_active, country, city
        FROM organizations
        WHERE parent_id = $1
        UNION ALL
        SELECT o.id, o.name, o.parent_id, o.created_at, o.slug, o.plan, o.is_active, o.country, o.city
        FROM organizations o
        INNER JOIN descendants d ON o.parent_id = d.id
      )
      SELECT id FROM descendants
      ORDER BY created_at ASC
    `,
      [parentId],
    );

    // Map to entities if we have results
    if (result.length === 0) {
      return [];
    }
    const ids = result.map((r: any) => r.id);
    return this.organizationRepo.find({
      where: { id: In(ids) },
      relations: ['parent'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Check if an organization is a descendant of another (for circular reference prevention)
   */
  private async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    if (ancestorId === descendantId) {
      return false; // Same organization
    }

    // Use recursive query to check if descendantId is in the tree under ancestorId
    const result = await this.dataSource.query(
      `
      WITH RECURSIVE descendants AS (
        SELECT id, parent_id
        FROM organizations
        WHERE id = $1
        UNION ALL
        SELECT o.id, o.parent_id
        FROM organizations o
        INNER JOIN descendants d ON o.parent_id = d.id
      )
      SELECT COUNT(*) as count
      FROM descendants
      WHERE id = $2
    `,
      [ancestorId, descendantId],
    );

    return parseInt(result[0]?.count || '0', 10) > 0;
  }
}

