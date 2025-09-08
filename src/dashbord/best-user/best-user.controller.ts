import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { BestUserService } from './best-user.service';
import { TopCustomersResponseDto } from './dto/top-customers.dto';
import { Roles } from 'src/users/Guards/roles.decorator';
import { UsersGuard } from 'src/users/Guards/users.guard';

@Controller()
export class BestUserController {
  constructor(private readonly bestUserService: BestUserService) {}

  @Get('top-customers')
  @Roles(['admin'])
  @UseGuards(UsersGuard)
  async getTopCustomers(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<TopCustomersResponseDto> {
    return this.bestUserService.getTopCustomers(limit);
  }
}
