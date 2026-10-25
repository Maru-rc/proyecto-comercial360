import {
  ResourceConflictException,
  EntityNotFoundException,
  InvalidOperationException,
} from '../../../domain-contracts/index.js';

export class ClienteYaExisteError extends ResourceConflictException {
  constructor(nit: string) {
    super(`Ya existe un cliente con el NIT '${nit}'`, { nit });
    this.name = 'ClienteYaExisteError';
  }
}

export class ClienteNoEncontradoError extends EntityNotFoundException {
  constructor(id: number | string) {
    super('Cliente', id);
    this.name = 'ClienteNoEncontradoError';
  }
}

export class CatalogoInvalidoError extends InvalidOperationException {
  constructor(catalogo: string, valor: string | number) {
    super(`Valor inválido '${valor}' para el catálogo '${catalogo}'`, {
      catalogo,
      valor,
    });
    this.name = 'CatalogoInvalidoError';
  }
}
