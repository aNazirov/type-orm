import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Common } from 'src/common';
import {
  UserRequest,
  UserRequestData,
} from 'src/common/decorators/user-request';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { DTO } from './dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  create(
    @Body() data: DTO.CreateDTO,
    @UserRequestData() userRequest: UserRequest,
  ) {
    return this.postsService.create(data, userRequest);
  }

  @Get('get-all')
  getAll(
    @Query('query') query: DTO.WhereDTO,
    @Query('pagination') paginationDTO: Common.Types.PaginationDTO,
  ) {
    const pagination = new Common.Classes.Pagination(
      paginationDTO?.skip,
      paginationDTO?.take,
    );

    return this.postsService.getAll(query, pagination);
  }

  @Get('get-by-id/:id')
  getById(@Param('id') id: number) {
    return this.postsService.getById(Number(id));
  }

  @Patch('update/:id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: number,
    @Body() data: DTO.UpdateDTO,
    @UserRequestData() userRequest: UserRequest,
  ) {
    return this.postsService.update(Number(id), data, userRequest);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  delete(@Param('id') id: number, @UserRequestData() userRequest: UserRequest) {
    return this.postsService.delete(Number(id), userRequest);
  }
}
