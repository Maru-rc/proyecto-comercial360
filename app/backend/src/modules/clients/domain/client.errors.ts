export class ClienteYaExisteError extends Error {
  constructor(nit: string) {
    super(`Ya existe un cliente con ese NIT`);
    this.name = 'ClienteYaExisteError';
  }
}

export class ClienteNoEncontradoError extends Error {
  constructor(id: number | string) {
    super(`No se encontró el cliente con ID ${id}`);
    this.name = 'ClienteNoEncontradoError';
  }
}

export class CatalogoInvalidoError extends Error {
  constructor(catalogo: string, valor: string | number) {
    super(`Valor inválido '${valor}' para el catálogo '${catalogo}'`);
    this.name = 'CatalogoInvalidoError';
  }
}
