import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImportJob, ImportStatus } from '../entities/import-job.entity';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from '../dto/create-property.dto';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectRepository(ImportJob)
    private importJobRepo: Repository<ImportJob>,
    private readonly propertyService: PropertyService,
  ) {}

  /**
   * Create an import job and process properties asynchronously
   */
  async createImportJob(
    properties: CreatePropertyDto[],
    userId: string,
    fileName?: string,
  ): Promise<ImportJob> {
    if (!properties || properties.length === 0) {
      throw new BadRequestException('No properties provided for import');
    }

    if (properties.length > 1000) {
      throw new BadRequestException('Maximum 1000 properties per import');
    }

    // Create import job
    const importJob = this.importJobRepo.create({
      userId,
      status: ImportStatus.PROCESSING,
      totalCount: properties.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      fileName: fileName || null,
    });

    const savedJob = await this.importJobRepo.save(importJob);

    // Process asynchronously (fire and forget for now)
    // TODO: Use a proper job queue (Bull, BullMQ) for production
    this.processImportJob(savedJob.id, properties, userId).catch((error) => {
      this.logger.error(`Import job ${savedJob.id} failed: ${error.message}`, error.stack);
    });

    return savedJob;
  }

  /**
   * Process import job (async)
   */
  private async processImportJob(
    jobId: string,
    properties: CreatePropertyDto[],
    userId: string,
  ): Promise<void> {
    const job = await this.importJobRepo.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException(`Import job ${jobId} not found`);
    }

    const errors: Array<{ row: number; property: any; errors: string[] }> = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each property
    for (let i = 0; i < properties.length; i++) {
      const propertyDto = properties[i];
      const row = i + 1; // 1-indexed for user-friendly error reporting

      try {
        // Validate and create property
        await this.propertyService.create({ ...propertyDto, userId }, userId);
        successCount++;
      } catch (error: any) {
        errorCount++;
        const errorMessages = Array.isArray(error.response?.message)
          ? error.response.message
          : [error.message || 'Unknown error'];

        errors.push({
          row,
          property: {
            type: propertyDto.type,
            price: propertyDto.price,
            city: propertyDto.city,
            country: propertyDto.country,
          },
          errors: errorMessages,
        });

        this.logger.warn(`Import job ${jobId}, row ${row} failed: ${errorMessages.join(', ')}`);
      }
    }

    // Update job status
    const finalStatus = errorCount === properties.length
      ? ImportStatus.FAILED
      : ImportStatus.COMPLETED;

    await this.importJobRepo.update(
      { id: jobId },
      {
        status: finalStatus,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : null,
        completedAt: new Date(),
      },
    );

    this.logger.log(
      `Import job ${jobId} completed: ${successCount} success, ${errorCount} errors`,
    );
  }

  /**
   * Get import job status
   */
  async getImportJobStatus(jobId: string, userId: string): Promise<ImportJob> {
    const job = await this.importJobRepo.findOne({
      where: { id: jobId, userId },
    });

    if (!job) {
      throw new NotFoundException(`Import job ${jobId} not found`);
    }

    return job;
  }

  /**
   * List import jobs for a user
   */
  async listImportJobs(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<{ jobs: ImportJob[]; total: number }> {
    const [jobs, total] = await this.importJobRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { jobs, total };
  }
}

