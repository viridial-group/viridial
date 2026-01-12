import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { Role } from './role.entity';
import { Resource } from './resource.entity';
import { Feature } from './feature.entity';
import { generateInternalCode, ENTITY_PREFIXES } from '../utils/code-generator';

@Entity({ name: 'permissions' })
@Index(['resourceId', 'action'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'internal_code', type: 'varchar', length: 50, unique: true })
  internalCode!: string;

  @Index()
  @Column({ name: 'external_code', type: 'varchar', length: 255, nullable: true })
  externalCode?: string | null;

  @Index()
  @Column({ name: 'resource_id', type: 'uuid' })
  resourceId!: string;

  @ManyToOne(() => Resource, (resource) => resource.permissions, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'resource_id' })
  resourceEntity!: Resource;

  // Keep resource name for backward compatibility (denormalized from Resource.name)
  @Column({ type: 'varchar', length: 100 })
  resource!: string; // e.g., 'property', 'user', 'organization'

  @Column({ type: 'varchar', length: 50 })
  action!: string; // e.g., 'read', 'write', 'delete', 'admin'

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Many-to-Many with Roles
  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];

  // Many-to-Many with Features
  @ManyToMany(() => Feature, (feature) => feature.permissions)
  features!: Feature[];

  @BeforeInsert()
  generateInternalCode() {
    if (!this.internalCode) {
      this.internalCode = generateInternalCode(ENTITY_PREFIXES.PERMISSION);
    }
  }
}

