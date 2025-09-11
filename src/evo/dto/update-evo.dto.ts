import { PartialType } from '@nestjs/mapped-types';
import { CreateEvoDto } from './create-evo.dto';

export class UpdateEvoDto extends PartialType(CreateEvoDto) {}
