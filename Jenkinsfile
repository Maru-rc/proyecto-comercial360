// ==============================================================================
// COMERCIAL 360 · Pipeline de despliegue (HU-21)
// ==============================================================================
// checkout → dependencias → calidad (lint, arquitectura, tests) → imágenes
// → migraciones → despliegue → smoke test, con rollback a la última versión buena.
//
// Requisitos en Jenkins (ver docs/DEPLOY.md):
//   - Credencial "Secret file" con el .env de producción (id: c360-env).
//   - Docker y el plugin compose disponibles para el agente (infra/jenkins/).
// ==============================================================================

pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
    timeout(time: 45, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  triggers {
    githubPush()
    // Sin URL pública no llega el webhook: Jenkins revisa el repositorio cada ~5 min.
    // Va aquí y no en la interfaz porque el Jenkinsfile reemplaza los disparadores del job.
    pollSCM('H/5 * * * *')
  }

  parameters {
    string(name: 'DEPLOY_BRANCH', defaultValue: 'main', description: 'Rama que se despliega; las demás solo pasan la calidad')
    string(name: 'ENV_CREDENTIAL_ID', defaultValue: 'c360-env', description: 'Id de la credencial Secret file con el .env de producción')
    string(name: 'FRONTEND_PORT', defaultValue: '8081', description: 'Puerto del host al que apunta el proxy inverso')
    string(name: 'PUBLIC_URL', defaultValue: '', description: 'URL pública para el smoke test (vacío: se prueba dentro del contenedor)')
    string(name: 'KEEP_IMAGES', defaultValue: '3', description: 'Versiones de imagen que se conservan para rollback')
    booleanParam(name: 'RUN_BOOTSTRAP', defaultValue: false, description: 'Crear catálogos y el primer director (primer despliegue)')
    booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Solo para emergencias: despliega sin tests')
  }

  environment {
    COMPOSE = 'docker compose -f docker-compose.prod.yml'
    ENV_FILE = '.env.deploy'
    STATE_DIR = "${env.JENKINS_HOME}/comercial360"
    CI = 'true'
    COREPACK_ENABLE_DOWNLOAD_PROMPT = '0'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.IMAGE_TAG = sh(script: 'git rev-parse --short=12 HEAD', returnStdout: true).trim()
          def branch = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: '').replaceFirst(/^origin\//, '')
          env.IS_DEPLOY = (branch == params.DEPLOY_BRANCH).toString()
          echo "Rama: ${branch} · imagen: ${env.IMAGE_TAG} · despliega: ${env.IS_DEPLOY}"
        }
      }
    }

    stage('Dependencias') {
      when { expression { !params.SKIP_TESTS } }
      steps {
        sh 'pnpm install --frozen-lockfile'
      }
    }

    stage('Calidad') {
      when { expression { !params.SKIP_TESTS } }
      parallel {
        stage('Lint y formato') {
          steps {
            sh 'pnpm -r run lint'
            sh 'pnpm exec prettier --check "app/backend/src/**/*.ts" "app/frontend/src/**/*.{ts,tsx,js,jsx}"'
          }
        }
        stage('Arquitectura') {
          steps { sh './scripts/check-clean-architecture.sh --all' }
        }
        stage('Tests backend') {
          steps {
            sh 'pnpm --filter backend exec tsc --noEmit'
            sh 'pnpm --filter backend run test:cov'
          }
        }
      }
    }

    stage('Imágenes') {
      when { environment name: 'IS_DEPLOY', value: 'true' }
      steps {
        withCredentials([file(credentialsId: params.ENV_CREDENTIAL_ID, variable: 'ENV_SRC')]) {
          sh 'install -m 600 "$ENV_SRC" "$ENV_FILE"'
        }
        sh '$COMPOSE build --pull'
      }
    }

    stage('Migraciones') {
      when { environment name: 'IS_DEPLOY', value: 'true' }
      steps {
        sh '$COMPOSE run --rm --no-deps backend migrate'
      }
    }

    stage('Primer director') {
      when {
        allOf {
          environment name: 'IS_DEPLOY', value: 'true'
          expression { params.RUN_BOOTSTRAP }
        }
      }
      steps {
        sh '$COMPOSE run --rm --no-deps backend bootstrap'
      }
    }

    stage('Despliegue') {
      when { environment name: 'IS_DEPLOY', value: 'true' }
      steps {
        withEnv(["FRONTEND_PORT=${params.FRONTEND_PORT}"]) {
          sh '$COMPOSE up -d --remove-orphans --wait --wait-timeout 180'
        }
      }
    }

    stage('Smoke test') {
      when { environment name: 'IS_DEPLOY', value: 'true' }
      steps {
        script {
          if (params.PUBLIC_URL?.trim()) {
            sh "curl -fsS --retry 10 --retry-delay 5 --retry-all-errors '${params.PUBLIC_URL.trim()}/api/health'"
          } else {
            sh '$COMPOSE exec -T frontend wget -qO- http://127.0.0.1/api/health'
          }
        }
      }
    }
  }

  post {
    success {
      script {
        if (env.IS_DEPLOY == 'true') {
          sh 'mkdir -p "$STATE_DIR" && echo "$IMAGE_TAG" > "$STATE_DIR/last_good_tag"'
          // Conserva las KEEP_IMAGES versiones más recientes de cada imagen
          sh """
            for repo in comercial360-backend comercial360-frontend; do
              docker image ls "\$repo" --format '{{.Tag}}' | grep -v '^latest\$' \\
                | tail -n +\$((${params.KEEP_IMAGES} + 1)) \\
                | xargs -r -I{} docker image rm "\$repo:{}" || true
            done
          """
        }
      }
    }
    failure {
      script {
        if (env.IS_DEPLOY == 'true' && fileExists("${env.STATE_DIR}/last_good_tag")) {
          def previous = readFile("${env.STATE_DIR}/last_good_tag").trim()
          if (previous && previous != env.IMAGE_TAG) {
            echo "Rollback a la versión ${previous}"
            withEnv(["IMAGE_TAG=${previous}", "FRONTEND_PORT=${params.FRONTEND_PORT}"]) {
              sh '$COMPOSE up -d --remove-orphans --wait --wait-timeout 180 || true'
            }
          }
        }
      }
    }
    always {
      sh 'rm -f "$ENV_FILE"'
    }
  }
}
