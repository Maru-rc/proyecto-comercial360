// Loads the .env file of the working directory, if there is one. Imported first
// by main.ts so that every module sees the variables when it is evaluated.
try {
  process.loadEnvFile();
} catch (error: unknown) {
  const isMissingFile =
    error instanceof Error &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ENOENT';
  if (!isMissingFile) {
    throw error;
  }
}
