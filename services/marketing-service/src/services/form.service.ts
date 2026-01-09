import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form } from '../entities/form.entity';
import { FormSubmission } from '../entities/form-submission.entity';
import { MarketingLead, LeadSource } from '../entities/marketing-lead.entity';
import { Analytics, AnalyticsEventType } from '../entities/analytics.entity';
import { LeadService } from './lead.service';
import { WorkflowService } from './workflow.service';

@Injectable()
export class FormService {
  constructor(
    @InjectRepository(Form)
    private formRepository: Repository<Form>,
    @InjectRepository(FormSubmission)
    private formSubmissionRepository: Repository<FormSubmission>,
    @InjectRepository(MarketingLead)
    private leadRepository: Repository<MarketingLead>,
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
    private leadService: LeadService,
    private workflowService: WorkflowService,
  ) {}

  async create(createDto: any): Promise<Form> {
    const form = this.formRepository.create(createDto);
    return await this.formRepository.save(form);
  }

  async findAll(organizationId: string): Promise<Form[]> {
    return await this.formRepository.find({
      where: { organizationId },
      relations: ['fields'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<Form> {
    return await this.formRepository.findOne({
      where: { id, organizationId },
      relations: ['fields'],
    });
  }

  async update(id: string, organizationId: string, updateDto: any): Promise<Form> {
    await this.formRepository.update({ id, organizationId }, updateDto);
    return await this.findOne(id, organizationId);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    await this.formRepository.delete({ id, organizationId });
  }

  /**
   * Soumet un formulaire
   */
  async submitForm(
    formId: string,
    data: Record<string, any>,
    metadata: {
      ipAddress?: string;
      userAgent?: string;
      referrer?: string;
      organizationId: string;
    },
  ): Promise<{ submission: FormSubmission; lead?: MarketingLead }> {
    const form = await this.formRepository.findOne({
      where: { id: formId, status: 'active' as any },
      relations: ['fields'],
    });

    if (!form) {
      throw new Error('Form not found or inactive');
    }

    // Valider les données selon les champs
    this.validateFormData(data, form.fields || []);

    // Créer ou mettre à jour le lead
    const email = data.email || data.emailAddress;
    let lead: MarketingLead | undefined;

    if (email) {
      lead = await this.leadService.create({
        email,
        firstName: data.firstName || data.first_name,
        lastName: data.lastName || data.last_name,
        phone: data.phone || data.phoneNumber,
        source: LeadSource.FORM,
        organizationId: metadata.organizationId,
        customFields: data,
      });

      // Ajouter au segment si défini
      if (form.segmentId && lead) {
        await this.leadService.addToSegment(lead.id, form.segmentId);
      }
    }

    // Créer la soumission
    const submission = this.formSubmissionRepository.create({
      formId,
      leadId: lead?.id,
      data,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      referrer: metadata.referrer,
      organizationId: metadata.organizationId,
    });

    const savedSubmission = await this.formSubmissionRepository.save(submission);

    // Mettre à jour le compteur du formulaire
    form.submissionCount += 1;
    await this.formRepository.save(form);

    // Enregistrer l'événement analytics
    await this.analyticsRepository.save({
      eventType: AnalyticsEventType.FORM_SUBMITTED,
      formId,
      leadId: lead?.id,
      organizationId: metadata.organizationId,
      metadata: { submissionId: savedSubmission.id },
    });

    // Déclencher le workflow si défini
    if (form.workflowId && lead) {
      await this.workflowService.triggerWorkflow(form.workflowId, lead.id);
    }

    return { submission: savedSubmission, lead };
  }

  /**
   * Valide les données du formulaire
   */
  private validateFormData(data: Record<string, any>, fields: any[]): void {
    for (const field of fields) {
      const value = data[field.name];

      if (field.required && (!value || value.trim() === '')) {
        throw new Error(`Field ${field.label} is required`);
      }

      // Validation par type
      if (value && field.type === 'email' && !this.isValidEmail(value)) {
        throw new Error(`Invalid email format for ${field.label}`);
      }
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
