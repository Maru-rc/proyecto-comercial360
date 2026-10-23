import { SetMetadata } from '@nestjs/common';

export const BYPASS_TRANSFORM_METADATA_KEY = 'BYPASS_TRANSFORM_METADATA_KEY';

/**
 * Decorator to bypass standard { data, meta } wrapping for specific endpoints
 * (e.g. streaming file downloads, health checks, direct redirects).
 */
export const BypassTransform = () =>
  SetMetadata(BYPASS_TRANSFORM_METADATA_KEY, true);
