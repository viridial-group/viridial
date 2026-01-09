import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from '../entities/email-template.entity';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  async create(createDto: any): Promise<EmailTemplate> {
    const template = this.emailTemplateRepository.create(createDto);
    return await this.emailTemplateRepository.save(template) as unknown as EmailTemplate;
  }

  async findAll(organizationId: string): Promise<EmailTemplate[]> {
    return await this.emailTemplateRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<EmailTemplate> {
    return await this.emailTemplateRepository.findOne({
      where: { id, organizationId },
    });
  }

  async update(id: string, organizationId: string, updateDto: any): Promise<EmailTemplate> {
    await this.emailTemplateRepository.update({ id, organizationId }, updateDto);
    return await this.findOne(id, organizationId);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    await this.emailTemplateRepository.delete({ id, organizationId });
  }
}

