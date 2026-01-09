import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { MarketingLead } from './marketing-lead.entity';
import { Campaign } from './campaign.entity';
import { Workflow } from './workflow.entity';

@Entity('marketing_segments')
export class Segment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  filters: Record<string, any>; // Filtres pour la segmentation dynamique

  @Column({ type: 'boolean', default: false })
  isDynamic: boolean; // Si true, les leads sont ajoutés automatiquement selon les filtres

  @Column({ type: 'int', default: 0 })
  leadCount: number;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => MarketingLead, (lead) => lead.segments)
  leads: MarketingLead[];

  @OneToMany(() => Campaign, (campaign) => campaign.segment)
  campaigns: Campaign[];

  @OneToMany(() => Workflow, (workflow) => workflow.segment)
  workflows: Workflow[];
}

