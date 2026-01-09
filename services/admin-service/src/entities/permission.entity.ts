import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  Index,
} from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'permissions' })
@Index(['resource', 'action'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  // Many-to-Many avec Roles
  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];
}

