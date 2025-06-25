import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create')
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async create(@Body() createReviewDto: CreateReviewDto, @Req() req) {
    return await this.reviewService.create(createReviewDto, req.user.id);
  }
  @Roles(['admin', 'user'])
  @UseGuards(UsersGuard)
  @Get(':id')
  async findAll(@Param('id') product_id: number) {
    return await this.reviewService.findAll(product_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(+id);
  }

  @Patch(':id')
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async update(
    @Param('id') id: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req,
  ) {
    return await this.reviewService.update(id, updateReviewDto, req.user.id);
  }

  @Delete(':id')
  @Roles(['user'])
  @UseGuards(UsersGuard)
  async remove(@Param('id') id: number, @Req() req) {
    return await this.reviewService.remove(id, req.user.id);
  }
}
