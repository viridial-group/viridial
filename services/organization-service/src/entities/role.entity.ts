import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  Index,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Permission } from './permission.entity';
import { UserRole } from './user-role.entity';
import { generateInternalCode, ENTITY_PREFIXES } from '../utils/code-generator';

@Entity({ name: 'roles' })
@Index(['organizationId', 'name'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'internal_code', type: 'varchar', length: 50, unique: true })
  internalCode!: string;

  @Index()
  @Column({ name: 'external_code', type: 'varchar', length: 255, nullable: true })
  externalCode?: string | null;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Index()
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId!: string | null; // null = global role (system admin)

  @ManyToOne(() => Organization, (org) => org.roles, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // Parent-child relationship for hierarchical roles
  @Index('idx_role_parent_id')
  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string | null;

  @ManyToOne(() => Role, (role) => role.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent?: Role | null;

  @OneToMany(() => Role, (role) => role.parent, { cascade: false, eager: false })
  children?: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Many-to-Many with Permissions
  @ManyToMany(() => Permission, (permission) => permission.roles, { cascade: false })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: Permission[];

  // One-to-Many with UserRole (junction table)
  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles!: UserRole[];

  @BeforeInsert()
  generateInternalCode() {
    if (!this.internalCode) {
      this.internalCode = generateInternalCode(ENTITY_PREFIXES.ROLE);
    }
  }
}

