#!/usr/bin/env node

/**
 * ==============================================================================
 * VALIDADOR DE CLEAN ARCHITECTURE & CLEAN CODE — COMERCIAL 360
 * ==============================================================================
 * Este script se ejecuta en el hook 'pre-commit' de Husky y en el CI/CD.
 * Revisa el código staged (o todos los archivos TS) para asegurar que ninguna
 * IA ni desarrollador rompa las reglas de arquitectura ni introduzca "vibecoding".
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const FORBIDDEN_DOMAIN_IMPORTS = [
  '@nestjs/',
  'typeorm',
  'express',
  '@aws-sdk/',
  'axios',
  'node-fetch',
  'http',
  'https'
];

let hasErrors = false;
const isFullScan = process.argv.includes('--all');

function getFilesToCheck() {
  if (isFullScan) {
    try {
      const output = execSync('git ls-files "app/backend/src/**/*.ts" "backend/src/**/*.ts"', { encoding: 'utf-8' });
      return output.split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf-8' });
    return output
      .split('\n')
      .filter((file) => file.endsWith('.ts') || file.endsWith('.tsx'))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function checkDomainPurity(filePath, content) {
  // Coincide con src/modules/<modulo>/domain/** o src/domain-contracts/domain/**
  const isDomainLayer = /src\/(?:modules\/[^/]+\/)?domain\//.test(filePath);
  if (!isDomainLayer) return;

  const lines = content.split('\n');
  lines.forEach((line, index) => {
    // Si la línea es un import
    if (/^\s*import\s+/.test(line)) {
      for (const forbidden of FORBIDDEN_DOMAIN_IMPORTS) {
        if (line.includes(`'${forbidden}`) || line.includes(`"${forbidden}`)) {
          console.error(`\x1b[31m[ERROR CLEAN ARCHITECTURE - DOMAIN PURITY]\x1b[0m`);
          console.error(`  Archivo: \x1b[33m${filePath}:${index + 1}\x1b[0m`);
          console.error(`  Línea ofensiva: \x1b[37m${line.trim()}\x1b[0m`);
          console.error(`  Razón: La capa de Dominio (Domain) NO puede importar librerías externas ni frameworks ('${forbidden}').`);
          console.error(`  Referencia: docs/Explicacion_Clean_Architecture.md (Capa 1: Enterprise Business Rules)`);
          console.error(`--------------------------------------------------------------------------------`);
          hasErrors = true;
        }
      }
    }
  });
}

function checkCrossModuleDirectImports(filePath, content) {
  // Detecta si un módulo importa carpetas internas de otro módulo
  // Ej: desde src/modules/visits/... importar ../../clients/domain/...
  const moduleMatch = filePath.match(/src\/modules\/([^/]+)\//);
  if (!moduleMatch) return;

  const currentModule = moduleMatch[1];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (/^\s*import\s+/.test(line)) {
      // Revisa si hace ../ hacia otro módulo
      const crossImportMatch = line.match(/from\s+['"](?:\.\.\/)+([^/'"]+)\/(domain|application|infrastructure|interfaces)/);
      if (crossImportMatch) {
        const targetModule = crossImportMatch[1];
        if (targetModule !== currentModule && targetModule !== 'domain-contracts') {
          console.error(`\x1b[31m[ERROR CLEAN ARCHITECTURE - BARRIL CENTRAL VIOLADO]\x1b[0m`);
          console.error(`  Archivo: \x1b[33m${filePath}:${index + 1}\x1b[0m`);
          console.error(`  Línea ofensiva: \x1b[37m${line.trim()}\x1b[0m`);
          console.error(`  Razón: El módulo '${currentModule}' está importando directamente carpetas internas del módulo '${targetModule}'.`);
          console.error(`  Solución obligatoria: Consume únicamente los contratos públicos desde 'src/domain-contracts'.`);
          console.error(`--------------------------------------------------------------------------------`);
          hasErrors = true;
        }
      }
    }
  });
}

function checkControllerCleanCode(filePath, content) {
  const isController = filePath.endsWith('.controller.ts');
  if (!isController) return;

  // Prohibir que un controlador inyecte repositorios directamente
  if (content.includes('@InjectRepository') || /private\s+readonly\s+\w+Repo/i.test(content)) {
    console.error(`\x1b[31m[ERROR CLEAN CODE - VIBECODING EN CONTROLLER]\x1b[0m`);
    console.error(`  Archivo: \x1b[33m${filePath}\x1b[0m`);
    console.error(`  Razón: Se detectó inyección de repositorios directamente en el Controlador HTTP.`);
    console.error(`  Solución obligatoria: Los controladores SOLO pueden invocar Casos de Uso (application/use-cases) mediante execute(dto).`);
    console.error(`--------------------------------------------------------------------------------`);
    hasErrors = true;
  }
}

function checkMigrationsIntegrity(files) {
  const migrationFiles = files.filter((f) => f.includes('migrations/'));
  if (migrationFiles.length === 0) return;

  let gitUser = '';
  try {
    gitUser = execSync('git config user.name', { encoding: 'utf-8' }).trim().toLowerCase();
  } catch {
    gitUser = 'unknown';
  }

  // Notificar o verificar autor
  console.log(`\x1b[36m[AUDITORÍA DE MIGRACIONES]\x1b[0m Detectados cambios en migraciones por: ${gitUser}`);
  console.log(`  Archivos: ${migrationFiles.join(', ')}`);
  console.log(`  Recordatorio: Solo @saul tiene la propiedad de migraciones en CODEOWNERS.\n`);
}

function runAudit() {
  const files = getFilesToCheck();
  if (files.length === 0) {
    process.exit(0);
  }

  console.log(`\x1b[34m[CLEAN CODE AUDITOR]\x1b[0m Verificando ${files.length} archivo(s)...`);

  checkMigrationsIntegrity(files);

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf-8');

    checkDomainPurity(file, content);
    checkCrossModuleDirectImports(file, content);
    checkControllerCleanCode(file, content);
  }

  if (hasErrors) {
    console.error(`\x1b[41m\x1b[37m COMMIT ABORTADO POR VIOLACIÓN DE CLEAN ARCHITECTURE \x1b[0m`);
    console.error(`Por favor corrige los errores señalados arriba antes de commitear.`);
    console.error(`Consulta AGENTS.md y docs/Explicacion_Clean_Architecture.md para más detalles.`);
    process.exit(1);
  }

  console.log(`\x1b[32m✔ Auditoría de Clean Architecture y Clean Code aprobada sin errores.\x1b[0m`);
}

runAudit();
