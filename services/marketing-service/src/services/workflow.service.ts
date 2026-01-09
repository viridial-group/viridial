import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Workflow, WorkflowStatus, WorkflowTrigger } from '../entities/workflow.entity';
import { WorkflowStep, WorkflowStepType } from '../entities/workflow-step.entity';
import { MarketingLead, LeadStatus } from '../entities/marketing-lead.entity';
import { EmailService } from './email.service';
import { Segment } from '../entities/segment.entity';
import { Analytics, AnalyticsEventType } from '../entities/analytics.entity';

interface WorkflowExecution {
  workflowId: string;
  leadId: string;
  currentStepId: string;
  stepExecutedAt: Date;
  nextStepScheduledAt?: Date;
}

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);
  private executions: Map<string, WorkflowExecution> = new Map();

  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowStep)
    private workflowStepRepository: Repository<WorkflowStep>,
    @InjectRepository(MarketingLead)
    private leadRepository: Repository<MarketingLead>,
    @InjectRepository(Segment)
    private segmentRepository: Repository<Segment>,
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
    private emailService: EmailService,
  ) {}

  /**
   * Crée un nouveau workflow
   */
  async create(createWorkflowDto: any): Promise<Workflow> {
    const workflow = this.workflowRepository.create(createWorkflowDto);
    return await this.workflowRepository.save(workflow) as unknown as Workflow;
  }

  /**
   * Récupère tous les workflows d'une organisation
   */
  async findAll(organizationId: string): Promise<Workflow[]> {
    return await this.workflowRepository.find({
      where: { organizationId },
      relations: ['steps', 'segment'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Récupère un workflow par ID
   */
  async findOne(id: string, organizationId: string): Promise<Workflow> {
    const workflow = await this.workflowRepository.findOne({
      where: { id, organizationId },
      relations: ['steps', 'segment'],
    });
    
    if (workflow && workflow.steps) {
      // Trier les steps par ordre
      workflow.steps.sort((a, b) => a.order - b.order);
    }
    
    return workflow;
  }

  /**
   * Met à jour un workflow
   */
  async update(id: string, organizationId: string, updateWorkflowDto: any): Promise<Workflow> {
    await this.workflowRepository.update({ id, organizationId }, updateWorkflowDto);
    return await this.findOne(id, organizationId);
  }

  /**
   * Supprime un workflow
   */
  async remove(id: string, organizationId: string): Promise<void> {
    await this.workflowRepository.delete({ id, organizationId });
  }

  /**
   * Active un workflow
   */
  async activate(id: string, organizationId: string): Promise<Workflow> {
    const workflow = await this.findOne(id, organizationId);
    workflow.status = WorkflowStatus.ACTIVE;
    return await this.workflowRepository.save(workflow) as unknown as Workflow;
  }

  /**
   * Déclenche un workflow pour un lead
   */
  async triggerWorkflow(workflowId: string, leadId: string): Promise<void> {
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId, status: WorkflowStatus.ACTIVE },
      relations: ['steps', 'segment'],
    });

    if (!workflow) {
      throw new Error('Workflow not found or not active');
    }

    const lead = await this.leadRepository.findOne({ where: { id: leadId } });
    if (!lead) {
      throw new Error('Lead not found');
    }

    // Vérifier les conditions du trigger
    if (!this.checkTriggerConditions(workflow, lead)) {
      this.logger.log(`Workflow ${workflowId} conditions not met for lead ${leadId}`);
      return;
    }

    // Vérifier le segment si défini
    if (workflow.segmentId) {
      const segment = await this.segmentRepository.findOne({
        where: { id: workflow.segmentId },
        relations: ['leads'],
      });
      const leadInSegment = segment?.leads.some((l) => l.id === leadId);
      if (!leadInSegment) {
        this.logger.log(`Lead ${leadId} not in segment for workflow ${workflowId}`);
        return;
      }
    }

    // Initialiser l'exécution
    const executionKey = `${workflowId}-${leadId}`;
    const firstStep = workflow.steps.sort((a, b) => a.order - b.order)[0];

    this.executions.set(executionKey, {
      workflowId,
      leadId,
      currentStepId: firstStep.id,
      stepExecutedAt: new Date(),
    });

    // Exécuter la première étape
    await this.executeStep(firstStep, leadId);

    this.logger.log(`Workflow ${workflowId} triggered for lead ${leadId}`);
  }

  /**
   * Vérifie les conditions de déclenchement
   */
  private checkTriggerConditions(workflow: Workflow, lead: MarketingLead): boolean {
    if (!workflow.triggerConditions) {
      return true;
    }

    // Implémenter la logique de vérification des conditions
    // Exemple: vérifier le statut du lead, les champs personnalisés, etc.
    return true;
  }

  /**
   * Exécute une étape du workflow
   */
  private async executeStep(step: WorkflowStep, leadId: string): Promise<void> {
    const lead = await this.leadRepository.findOne({ where: { id: leadId } });
    if (!lead) {
      throw new Error('Lead not found');
    }

    switch (step.type) {
      case WorkflowStepType.SEND_EMAIL:
        if (step.emailTemplateId) {
          await this.emailService.queueEmail(
            leadId,
            step.emailTemplateId,
            null,
            step.config?.variables || {},
          );
        }
        break;

      case WorkflowStepType.WAIT:
        // La logique d'attente est gérée dans processWorkflows
        break;

      case WorkflowStepType.UPDATE_LEAD:
        if (step.config?.fields) {
          Object.assign(lead, step.config.fields);
          await this.leadRepository.save(lead);
        }
        break;

      case WorkflowStepType.ADD_TO_SEGMENT:
        if (step.config?.segmentId) {
          const segment = await this.segmentRepository.findOne({
            where: { id: step.config.segmentId },
            relations: ['leads'],
          });
          if (segment && !segment.leads.some((l) => l.id === leadId)) {
            segment.leads.push(lead);
            await this.segmentRepository.save(segment);
          }
        }
        break;

      case WorkflowStepType.REMOVE_FROM_SEGMENT:
        if (step.config?.segmentId) {
          const segment = await this.segmentRepository.findOne({
            where: { id: step.config.segmentId },
            relations: ['leads'],
          });
          if (segment) {
            segment.leads = segment.leads.filter((l) => l.id !== leadId);
            await this.segmentRepository.save(segment);
          }
        }
        break;

      case WorkflowStepType.CONDITION:
        // Évaluer les conditions et décider du chemin
        // TODO: Implémenter la logique de condition
        break;
    }

    // Enregistrer l'événement analytics
    await this.analyticsRepository.save({
      eventType: AnalyticsEventType.LEAD_UPDATED,
      leadId,
      metadata: { workflowStepId: step.id, stepType: step.type },
      organizationId: lead.organizationId,
    });
  }

  /**
   * Traite les workflows en attente (à appeler périodiquement)
   */
  async processWorkflows(): Promise<void> {
    const activeWorkflows = await this.workflowRepository.find({
      where: { status: WorkflowStatus.ACTIVE },
      relations: ['steps'],
    });

    for (const workflow of activeWorkflows) {
      // Traiter les workflows selon leur trigger
      if (workflow.trigger === WorkflowTrigger.DATE_REACHED) {
        // Traiter les workflows déclenchés par date
        await this.processDateTriggeredWorkflows(workflow);
      }
    }

    // Traiter les étapes WAIT qui doivent être exécutées maintenant
    await this.processWaitSteps();
  }

  /**
   * Traite les workflows déclenchés par date
   */
  private async processDateTriggeredWorkflows(workflow: Workflow): Promise<void> {
    // TODO: Implémenter la logique
  }

  /**
   * Traite les étapes WAIT qui doivent être exécutées
   */
  private async processWaitSteps(): Promise<void> {
    // Récupérer toutes les exécutions en cours avec des étapes WAIT
    // Vérifier si le délai est écoulé et passer à l'étape suivante
    // TODO: Implémenter la logique complète avec stockage en base de données
  }
}

