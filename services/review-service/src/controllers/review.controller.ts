import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { ReviewVoteService } from '../services/review-vote.service';
import { ReviewResponseService } from '../services/review-response.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { ReviewQueryDto } from '../dto/review-query.dto';
import { ReviewFilterDto } from '../dto/review-filter.dto';
import { VoteReviewDto } from '../dto/vote-review.dto';
import { CreateResponseDto } from '../dto/create-response.dto';
import { UpdateResponseDto } from '../dto/update-response.dto';
import { ReviewResponseDto, ReviewStatsDto } from '../dto/review-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { ReviewEntityType } from '../entities/review.entity';
import { ReviewResponseEntity } from '../entities/review-response.entity';

interface AuthenticatedUser {
  id: string;
  email: string;
}

@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly voteService: ReviewVoteService,
    private readonly responseService: ReviewResponseService,
  ) {}

  /**
   * Health check endpoint
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return { status: 'ok', service: 'review-service' };
  }

  /**
   * Create a new review (requires authentication)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateReviewDto,
    @User() user: AuthenticatedUser,
  ): Promise<ReviewResponseDto> {
    return this.reviewService.create(createDto, user.id);
  }

  /**
   * Get all reviews with optional filters and pagination (legacy endpoint)
   */
  @Get()
  async findAll(
    @Query() query: ReviewQueryDto,
    @User() user?: AuthenticatedUser,
  ): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.reviewService.findAll({ ...query, userId: user?.id });
  }

  /**
   * Get all reviews with advanced filters, sorting, and pagination
   */
  @Get('search')
  async findAllAdvanced(
    @Query() filter: ReviewFilterDto,
    @User() user?: AuthenticatedUser,
  ): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.reviewService.findAllAdvanced(filter, user?.id);
  }

  /**
   * Get review statistics for an entity
   */
  @Get('stats/:entityType/:entityId')
  async getStats(
    @Param('entityType') entityType: ReviewEntityType,
    @Param('entityId') entityId: string,
  ): Promise<ReviewStatsDto> {
    return this.reviewService.getStats(entityType, entityId);
  }

  /**
   * Get a single review by ID
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @User() user?: AuthenticatedUser,
  ): Promise<ReviewResponseDto> {
    return this.reviewService.findOne(id, user?.id);
  }

  /**
   * Update a review (requires authentication, only owner)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateReviewDto,
    @User() user: AuthenticatedUser,
  ): Promise<ReviewResponseDto> {
    return this.reviewService.update(id, updateDto, user.id);
  }

  /**
   * Delete a review (soft delete, requires authentication, only owner)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @User() user: AuthenticatedUser): Promise<void> {
    return this.reviewService.remove(id, user.id);
  }

  /**
   * Vote on a review (helpful or not helpful) - requires authentication
   */
  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async vote(
    @Param('id') id: string,
    @Body() voteDto: VoteReviewDto,
    @User() user: AuthenticatedUser,
  ): Promise<void> {
    return this.voteService.vote(id, user.id, voteDto);
  }

  /**
   * Remove vote from a review - requires authentication
   * Note: Users can also remove vote by voting again with the same type
   */
  @Delete(':id/vote')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeVote(
    @Param('id') id: string,
    @Query('type') voteType: 'helpful' | 'not_helpful',
    @User() user: AuthenticatedUser,
  ): Promise<void> {
    if (!voteType || (voteType !== 'helpful' && voteType !== 'not_helpful')) {
      throw new BadRequestException('Vote type must be "helpful" or "not_helpful"');
    }
    await this.voteService.removeVote(id, user.id, voteType as any);
  }

  /**
   * Create a response to a review (requires authentication, usually by owner/manager)
   */
  @Post(':id/responses')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createResponse(
    @Param('id') id: string,
    @Body() createDto: CreateResponseDto,
    @User() user: AuthenticatedUser,
  ): Promise<ReviewResponseEntity> {
    return this.responseService.createResponse(id, user.id, createDto);
  }

  /**
   * Update a response (requires authentication, only owner)
   */
  @Put('responses/:responseId')
  @UseGuards(JwtAuthGuard)
  async updateResponse(
    @Param('responseId') responseId: string,
    @Body() updateDto: UpdateResponseDto,
    @User() user: AuthenticatedUser,
  ): Promise<ReviewResponseEntity> {
    return this.responseService.updateResponse(responseId, user.id, updateDto);
  }

  /**
   * Delete a response (soft delete, requires authentication, only owner)
   */
  @Delete('responses/:responseId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteResponse(
    @Param('responseId') responseId: string,
    @User() user: AuthenticatedUser,
  ): Promise<void> {
    return this.responseService.deleteResponse(responseId, user.id);
  }
}

