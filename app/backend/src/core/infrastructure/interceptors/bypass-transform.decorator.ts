import { SetMetadata } from '@nestjs/common';

export const BYPASS_TRANSFORM_METADATA_KEY = 'BYPASS_TRANSFORM_METADATA_KEY';

/**
 * Decorador para omitir la envoltura { data, meta } en endpoints específicos
 * (ej. descargas de archivos en streaming, métricas, redirects).
 */
export const BypassTransform = () =>
  SetMetadata(BYPASS_TRANSFORM_METADATA_KEY, true);
