import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
} from 'typeorm';
import { Permission } from './permission.entity';
import { generateInternalCode, ENTITY_PREFIXES } from '../utils/code-generator';

@Entity({ name: 'resources' })
@Index(['name'], { unique: true })
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'internal_code', type: 'varchar', length: 50, unique: true })
  internalCode!: string;

  @Index()
  @Column({ name: 'external_code', type: 'varchar', length: 255, nullable: true })
  externalCode?: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string; // e.g., 'property', 'user', 'organization'

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string; // e.g., 'core', 'admin', 'billing'

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // One-to-Many with Permissions
  @OneToMany(() => Permission, (permission) => permission.resourceEntity)
  permissions!: Permission[];

  @BeforeInsert()
  generateInternalCode() {
    if (!this.internalCode) {
      this.internalCode = generateInternalCode(ENTITY_PREFIXES.RESOURCE || 'RES');
    }
  }
}

