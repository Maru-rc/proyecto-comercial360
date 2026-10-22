#!/usr/bin/env bash

# ==============================================================================
# AUDITOR DE CLEAN ARCHITECTURE, SOLID & CLEAN CODE — COMERCIAL 360
# ==============================================================================
# Este script se ejecuta en el hook pre-commit de Husky y en Jenkins.
# Aborta el commit si se detectan violaciones de SOLID, Clean Architecture o "vibecoding".
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

HAS_ERRORS=0

# Resuelve los "." y ".." de una ruta sin depender de realpath (no es igual en macOS)
normalize_path() {
  local -a segments parts=()
  local segment
  IFS='/' read -ra segments <<< "$1"
  for segment in "${segments[@]}"; do
    case "$segment" in
      '' | '.') ;;
      '..')
        if [ ${#parts[@]} -gt 0 ]; then
          parts=("${parts[@]:0:${#parts[@]}-1}")
        fi
        ;;
      *) parts+=("$segment") ;;
    esac
  done
  local IFS='/'
  echo "${parts[*]}"
}

# Obtener archivos en el área de preparación (staged)
if [ "$1" == "--all" ]; then
  FILES=$(git ls-files "app/backend/src/**/*.ts" "backend/src/**/*.ts" 2>/dev/null || true)
else
  FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)
fi

if [ -z "$FILES" ]; then
  exit 0
fi

echo -e "${BLUE}[SOLID & CLEAN ARCHITECTURE AUDITOR]${NC} Verificando reglas de Uncle Bob..."

for FILE in $FILES; do
  if [ ! -f "$FILE" ]; then
    continue
  fi

  # ==============================================================================
  # 1. REGLA DE DOMINIO PURO (Clean Architecture - Capa 1)
  # src/modules/*/domain/ NO puede importar frameworks ni librerías externas
  # ==============================================================================
  if [[ "$FILE" =~ src/(modules/[^/]+/)?domain/ ]]; then
    if grep -n -E "from ['\"](@nestjs/|typeorm|express|@aws-sdk/|axios|node-fetch)" "$FILE" > /tmp/domain_err.txt 2>/dev/null; then
      echo -e "${RED}[ERROR CLEAN ARCHITECTURE - DOMINIO CONTAMINADO]${NC}"
      echo -e "  Archivo: ${YELLOW}$FILE${NC}"
      while IFS= read -r line; do
        echo -e "  Línea ofensiva: $line"
      done < /tmp/domain_err.txt
      echo -e "  Razón: La capa de Dominio (Domain) debe ser TypeScript puro sin acoplamiento a frameworks."
      echo -e "  Referencia: docs/Explicacion_Clean_Architecture.md"
      echo -e "--------------------------------------------------------------------------------"
      HAS_ERRORS=1
    fi
  fi

  # ==============================================================================
  # 2. REGLA DIP (Dependency Inversion Principle - SOLID)
  # application/use-cases NO puede importar TypeORM ni implementaciones de infraestructura
  # ==============================================================================
  if [[ "$FILE" =~ src/modules/[^/]+/application/ ]]; then
    if grep -n -E "from ['\"]typeorm['\"]" "$FILE" > /tmp/dip_err.txt 2>/dev/null; then
      echo -e "${RED}[ERROR SOLID - VIOLACIÓN DE DIP (Dependency Inversion)]${NC}"
      echo -e "  Archivo: ${YELLOW}$FILE${NC}"
      while IFS= read -r line; do
        echo -e "  Línea ofensiva: $line"
      done < /tmp/dip_err.txt
      echo -e "  Razón: La capa Application debe depender de Puertos (Interfaces), jamás de TypeORM directamente."
      echo -e "  Solución: Inyecta el Puerto abstracto (@Inject(CLIENT_REPOSITORY)) definido en application/ports."
      echo -e "--------------------------------------------------------------------------------"
      HAS_ERRORS=1
    fi

    if grep -n -E "from ['\"](\.\./)+infrastructure/" "$FILE" > /tmp/dip_infra_err.txt 2>/dev/null; then
      echo -e "${RED}[ERROR SOLID - VIOLACIÓN DE DIP / REGLA DE DEPENDENCIA]${NC}"
      echo -e "  Archivo: ${YELLOW}$FILE${NC}"
      while IFS= read -r line; do
        echo -e "  Línea ofensiva: $line"
      done < /tmp/dip_infra_err.txt
      echo -e "  Razón: Un Caso de Uso no puede importar la capa 'infrastructure'. Las dependencias apuntan hacia adentro."
      echo -e "--------------------------------------------------------------------------------"
      HAS_ERRORS=1
    fi
  fi

  # ==============================================================================
  # 3. REGLA SRP (Single Responsibility Principle - SOLID)
  # Prohibición de "Servicios Dios" con múltiples métodos desordenados
  # ==============================================================================
  if [[ "$FILE" =~ use-case\.ts$ ]]; then
    # Verificar que el caso de uso tenga un método execute
    if ! grep -q "execute(" "$FILE"; then
      echo -e "${YELLOW}[ADVERTENCIA SOLID - SRP EN CASO DE USO]${NC}"
      echo -e "  Archivo: ${YELLOW}$FILE${NC}"
      echo -e "  Aviso: Cada Caso de Uso debe tener un único método público 'execute(dto)'."
      echo -e "--------------------------------------------------------------------------------"
    fi
  fi

  # ==============================================================================
  # 4. REGLA DEL BARRIL CENTRAL & ISP (Interface Segregation Principle)
  # Prohibido importar carpetas internas de otro módulo directamente
  # ==============================================================================
  if [[ "$FILE" =~ src/modules/([^/]+)/ ]]; then
    CURRENT_MOD="${BASH_REMATCH[1]}"
    if grep -n -E "from ['\"]\.\./" "$FILE" > /tmp/cross_err.txt 2>/dev/null; then
      while IFS= read -r line; do
        IMPORT_PATH=$(echo "$line" | sed -E "s/.*from ['\"]([^'\"]+)['\"].*/\1/")
        # Ruta real del import dentro de src/ (ej: modules/auth/domain/role.js)
        TARGET_PATH=$(normalize_path "$(dirname "$FILE")/$IMPORT_PATH")
        TARGET_PATH="${TARGET_PATH#*src/}"
        case "$TARGET_PATH" in
          "modules/$CURRENT_MOD/"* | domain-contracts/*) continue ;;
        esac
        if [[ "$TARGET_PATH" =~ (^|/)(domain|application|infrastructure|interfaces)/ ]]; then
          TARGET_MOD=$(echo "$TARGET_PATH" | sed -E 's#^modules/##; s#/.*##')
          echo -e "${RED}[ERROR CLEAN ARCHITECTURE / ISP - BARRIL CENTRAL VIOLADO]${NC}"
          echo -e "  Archivo: ${YELLOW}$FILE${NC}"
          echo -e "  Línea ofensiva: $line"
          echo -e "  Razón: El módulo '$CURRENT_MOD' está importando directamente el módulo '$TARGET_MOD'."
          echo -e "  Solución: Consume contratos públicos y puertos segregados exclusivamente desde 'src/domain-contracts'."
          echo -e "--------------------------------------------------------------------------------"
          HAS_ERRORS=1
        fi
      done < /tmp/cross_err.txt
    fi
  fi

  # ==============================================================================
  # 5. REGLA ANTI-VIBECODING EN CONTROLLERS (Separation of Concerns)
  # Prohibido inyectar TypeORM en controllers
  # ==============================================================================
  if [[ "$FILE" == *".controller.ts" ]]; then
    if grep -n -E "(@InjectRepository|Repository<)" "$FILE" > /tmp/ctrl_err.txt 2>/dev/null; then
      echo -e "${RED}[ERROR CLEAN CODE / SRP - VIBECODING EN CONTROLLER]${NC}"
      echo -e "  Archivo: ${YELLOW}$FILE${NC}"
      while IFS= read -r line; do
        echo -e "  Línea ofensiva: $line"
      done < /tmp/ctrl_err.txt
      echo -e "  Razón: Los controladores NO deben inyectar repositorios de base de datos."
      echo -e "  Solución: Invoca únicamente Casos de Uso (application/use-cases) mediante execute(dto)."
      echo -e "--------------------------------------------------------------------------------"
      HAS_ERRORS=1
    fi
  fi

done

if [ $HAS_ERRORS -eq 1 ]; then
  echo -e "\n\033[41m\033[37m COMMIT ABORTADO POR VIOLACIÓN DE SOLID / CLEAN ARCHITECTURE \033[0m"
  echo -e "Corrige los errores señalados arriba. Consulta AGENTS.md y docs/Explicacion_Clean_Architecture.md.\n"
  exit 1
fi

echo -e "${GREEN}✔ Auditoría de SOLID y Clean Architecture aprobada sin errores.${NC}"
exit 0
