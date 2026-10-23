import {
  AsesorFueraDeAlcanceError,
  AsesorNoVinculadoError,
} from '../../domain/auth.errors.js';
import { AsesorRecord, AsesorRepository } from '../ports/asesor.repository.js';
import { ResolveAsesorScopeUseCase } from './resolve-asesor-scope.use-case.js';

class InMemoryAsesores implements AsesorRepository {
  constructor(private readonly items: AsesorRecord[]) {}
  async findByEmail(email: string) {
    return this.items.find((a) => a.correo === email) ?? null;
  }
}

const asesores = [
  {
    idAsesor: 1,
    nombre: 'Ana',
    correo: 'ana@x.com',
    telefono: null,
    estado: 'ACTIVE',
  },
  {
    idAsesor: 2,
    nombre: 'Beto',
    correo: 'beto@x.com',
    telefono: null,
    estado: 'ACTIVE',
  },
];
const ana = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@x.com',
  role: 'ASESOR' as const,
};
const director = {
  id: 'u9',
  name: 'Dir',
  email: 'dir@x.com',
  role: 'DIRECTOR' as const,
};

describe('ResolveAsesorScopeUseCase (9. un asesor no ve datos de otro asesor)', () => {
  const useCase = new ResolveAsesorScopeUseCase(new InMemoryAsesores(asesores));

  it('el asesor siempre queda limitado a su propio id', async () => {
    expect(await useCase.execute(ana)).toBe(1);
    expect(await useCase.execute(ana, 1)).toBe(1);
  });

  it('rechaza al asesor que pide los datos de otro asesor', async () => {
    await expect(useCase.execute(ana, 2)).rejects.toBeInstanceOf(
      AsesorFueraDeAlcanceError,
    );
  });

  it('el director puede pedir cualquier asesor o todos', async () => {
    expect(await useCase.execute(director, 2)).toBe(2);
    expect(await useCase.execute(director)).toBeNull();
  });

  it('un asesor sin registro no tiene alcance', async () => {
    await expect(
      useCase.execute({
        id: 'u5',
        name: 'Z',
        email: 'z@x.com',
        role: 'ASESOR',
      }),
    ).rejects.toBeInstanceOf(AsesorNoVinculadoError);
  });
});
