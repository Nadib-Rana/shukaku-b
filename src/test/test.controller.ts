import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  @ResponseMessage('User created successfully')
  create(@Body() createTestDto: CreateTestDto) {
    return this.testService.create(createTestDto);
  }

  @Get()
  @ResponseMessage('Users fetched successfully')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.testService.findAll(page, limit);
  }

  @Get(':id')
  @ResponseMessage('User details fetched successfully')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.testService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('User updated successfully')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTestDto: UpdateTestDto,
  ) {
    return this.testService.update(id, updateTestDto);
  }

  @Delete(':id')
  @ResponseMessage('User deleted successfully')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.testService.remove(id);
  }
}
