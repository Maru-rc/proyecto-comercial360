import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Almacén de contexto asíncrono para propagar el ID de correlación (Trace ID)
 * a lo largo de toda la cadena de ejecución sin ensuciar la firma de los métodos.
 */
export class CorrelationContext {
  private static readonly storage = new AsyncLocalStorage<string>();

  static run<T>(correlationId: string, callback: () => T): T {
    return this.storage.run(correlationId, callback);
  }

  static getCorrelationId(): string | undefined {
    return this.storage.getStore();
  }
}
