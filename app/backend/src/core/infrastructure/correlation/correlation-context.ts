import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Asynchronous context store to propagate correlation IDs (Trace IDs)
 * across the execution chain without polluting method signatures.
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
