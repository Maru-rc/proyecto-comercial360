import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsesorOrmEntity } from './entities/asesor.orm-entity.js';
import {
  AsesorRecord,
  AsesorRepository,
} from '../../application/ports/asesor.repository.js';

@Injectable()
export class TypeOrmAsesorRepository implements AsesorRepository {
  constructor(
    @InjectRepository(AsesorOrmEntity)
    private readonly repo: Repository<AsesorOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<AsesorRecord | null> {
    // Better Auth guarda el correo en minúsculas; comparamos sin distinguir mayúsculas.
    return this.repo
      .createQueryBuilder('a')
      .where('LOWER(a.correo) = LOWER(:email)', { email })
      .getOne();
  }
}
