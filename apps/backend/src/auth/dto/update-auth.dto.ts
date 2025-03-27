import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(RegisterDto) {}
