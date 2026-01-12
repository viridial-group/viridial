import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
  BeforeInsert,
} from 'typeorm';
import { Permission } from './permission.entity';
import { generateInternalCode, ENTITY_PREFIXES } from '../utils/code-generator';

@Entity({ name: 'features' })
@Index(['name'], { unique: true })
export class Feature {
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
  name!: string; // e.g., 'property-management', 'user-management', 'billing'

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string; // e.g., 'core', 'premium', 'addon'

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Many-to-Many with Permissions
  @ManyToMany(() => Permission, (permission) => permission.features, { cascade: false })
  @JoinTable({
    name: 'feature_permissions',
    joinColumn: { name: 'feature_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: Permission[];

  @BeforeInsert()
  generateInternalCode() {
    if (!this.internalCode) {
      this.internalCode = generateInternalCode(ENTITY_PREFIXES.FEATURE);
    }
  }
}

