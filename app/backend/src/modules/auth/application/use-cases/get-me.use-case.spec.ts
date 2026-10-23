import { AsesorNoVinculadoError } from '../../domain/auth.errors.js';
import { AsesorRecord, AsesorRepository } from '../ports/asesor.repository.js';
import { GetMeUseCase } from './get-me.use-case.js';

class InMemoryAsesores implements AsesorRepository {
  constructor(private readonly items: AsesorRecord[]) {}
  async findByEmail(email: string) {
    return (
      this.items.find((a) => a.correo.toLowerCase() === email.toLowerCase()) ??
      null
    );
  }
}

const juan: AsesorRecord = {
  idAsesor: 7,
  nombre: 'Juan',
  correo: 'Juan.Perez@x.com',
  telefono: '300',
  estado: 'ACTIVE',
};

describe('GetMeUseCase', () => {
  const useCase = new GetMeUseCase(new InMemoryAsesores([juan]));

  it('devuelve el asesor vinculado por correo y el rol ASESOR', async () => {
    const me = await useCase.execute({
      id: 'u1',
      name: 'Juan',
      email: 'juan.perez@x.com',
      role: 'ASESOR',
    });
    expect(me).toEqual({
      id: 'u1',
      nombre: 'Juan',
      email: 'juan.perez@x.com',
      rol: 'ASESOR',
      asesor: { id_asesor: 7, telefono: '300', estado: 'ACTIVE' },
    });
  });

  it('el director no trae asesor, aunque exista uno con su correo', async () => {
    const me = await useCase.execute({
      id: 'u2',
      name: 'Dir',
      email: 'juan.perez@x.com',
      role: 'DIRECTOR',
    });
    expect(me.rol).toBe('DIRECTOR');
    expect(me.asesor).toBeNull();
  });

  it('un asesor sin registro en ASESOR lanza AsesorNoVinculadoError', async () => {
    await expect(
      useCase.execute({
        id: 'u3',
        name: 'X',
        email: 'otro@x.com',
        role: 'ASESOR',
      }),
    ).rejects.toBeInstanceOf(AsesorNoVinculadoError);
  });
});
