import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserFiltersDto } from '../dto/user-filters.dto';
import { User } from '../entities/user.entity';

@Controller('api/organizations/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ============ User Endpoints ============

  /**
   * Create a new user
   * POST /users
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    // For simplicity, organizationId is passed directly. In a real app, it would come from auth context.
    return this.userService.create(createUserDto, createUserDto.organizationId);
  }

  /**
   * Get all users
   * GET /users
   */
  @Get()
  async findAllUsers(@Query() filters: UserFiltersDto, @Query('organizationId') organizationId?: string): Promise<User[]> {
    return this.userService.findAll(filters, organizationId);
  }

  /**
   * Get a user by ID
   * GET /users/:id
   */
  @Get(':id')
  async findOneUser(@Param('id') id: string, @Query('organizationId') organizationId?: string): Promise<User> {
    return this.userService.findOne(id, organizationId);
  }

  /**
   * Update a user
   * PUT /users/:id
   */
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Query('organizationId') organizationId?: string,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto, organizationId);
  }

  /**
   * Delete a user
   * DELETE /users/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUser(@Param('id') id: string, @Query('organizationId') organizationId?: string): Promise<void> {
    await this.userService.remove(id, organizationId);
  }

  // ============ User Role Management Endpoints ============

  /**
   * Assign roles to a user
   * POST /users/:id/roles
   */
  @Post(':id/roles')
  async assignRoles(
    @Param('id') id: string,
    @Body() body: { roleIds: string[] },
  ): Promise<User> {
    return this.userService.assignRoles(id, body.roleIds);
  }

  /**
   * Remove roles from a user
   * DELETE /users/:id/roles
   */
  @Delete(':id/roles')
  async removeRoles(
    @Param('id') id: string,
    @Body() body: { roleIds: string[] },
  ): Promise<User> {
    return this.userService.removeRoles(id, body.roleIds);
  }

  // ============ User Password Management Endpoints ============

  /**
   * Update user password
   * PUT /users/:id/password
   */
  @Put(':id/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePassword(
    @Param('id') id: string,
    @Body() body: { password: string },
  ): Promise<void> {
    await this.userService.updatePassword(id, body.password);
  }
}

