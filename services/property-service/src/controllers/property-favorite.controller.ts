import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PropertyFavoriteService } from '../services/property-favorite.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';

interface AuthenticatedUser {
  id: string;
  email: string;
}

@Controller('properties')
export class PropertyFavoriteController {
  constructor(private readonly favoriteService: PropertyFavoriteService) {}

  /**
   * Add property to favorites
   * POST /properties/:id/favorite
   */
  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addFavorite(@Param('id') propertyId: string, @User() user: AuthenticatedUser) {
    return this.favoriteService.addFavorite(propertyId, user.id);
  }

  /**
   * Remove property from favorites
   * DELETE /properties/:id/favorite
   */
  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFavorite(@Param('id') propertyId: string, @User() user: AuthenticatedUser) {
    await this.favoriteService.removeFavorite(propertyId, user.id);
  }

  /**
   * Check if property is favorited
   * GET /properties/:id/favorite
   */
  @Get(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async isFavorited(@Param('id') propertyId: string, @User() user: AuthenticatedUser) {
    const isFavorited = await this.favoriteService.isFavorited(propertyId, user.id);
    return { isFavorited };
  }

  /**
   * Get user's favorite properties
   * GET /properties/favorites?limit=20&offset=0
   */
  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  async getUserFavorites(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @User() user?: AuthenticatedUser,
  ) {
    if (!user) {
      throw new Error('User not authenticated');
    }
    return this.favoriteService.getUserFavorites(user.id, limit, offset);
  }

  /**
   * Get favorite count for a property
   * GET /properties/:id/favorites/count
   */
  @Get(':id/favorites/count')
  async getFavoriteCount(@Param('id') propertyId: string) {
    const count = await this.favoriteService.getFavoriteCount(propertyId);
    return { count };
  }
}

