// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

// ─────────────────────────────────────────────────────────────
// Clean Architecture — Regla de Dependencia (ver CLEAN_ARCHITECTURE.md)
//   domain          → solo domain
//   application     → domain
//   infrastructure  → domain + shared/infrastructure
//   presentation    → application, domain (+ infrastructure como raíz de composición)
//   app/            → presentation, domain
// Cada regex se evalúa contra el texto del import, así que cubre tanto
// alias (@features/..., @shared/...) como rutas relativas (../../infrastructure/...).
// ─────────────────────────────────────────────────────────────

// Segmento de ruta de una capa: "/infrastructure/", "../presentation/x", etc.
const layer = (...names) => `(^|/)(${names.join("|")})(/|$)`;

const UI_ONLY = {
  regex: layer("theme", "components"),
  message: "Las capas internas no pueden depender de la UI compartida (theme/components).",
};
const ROUTES = {
  regex: "(^|/)app/",
  message: "Ninguna capa de src/ puede importar pantallas de app/ (Expo Router).",
};

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },

  // 1. DOMAIN: núcleo puro, sin frameworks ni otras capas.
  {
    files: ["src/features/*/domain/**/*.{ts,tsx}", "src/shared/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: layer("application", "infrastructure", "presentation"),
              message: "domain no puede depender de application, infrastructure ni presentation.",
            },
            {
              // Cualquier import que no sea relativo ni un alias de domain
              // (react, react-native, expo-*, @supabase/*, zustand, ...).
              regex: "^(?!\\.{1,2}/|@features/[^/]+/domain/|@shared/domain/)",
              message: "domain debe ser TypeScript puro: no importes librerías externas.",
            },
            UI_ONLY,
            ROUTES,
          ],
        },
      ],
    },
  },

  // 2. APPLICATION: casos de uso, solo conocen domain.
  {
    files: ["src/features/*/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: layer("infrastructure", "presentation"),
              message:
                "application solo depende de domain. Recibe el repositorio por constructor (IChatRepository / IAuthRepository).",
            },
            {
              regex: "^(?!\\.{1,2}/|@features/[^/]+/(domain|application)/|@shared/domain/)",
              message: "Los casos de uso no pueden importar librerías externas (react, supabase, expo...).",
            },
            UI_ONLY,
            ROUTES,
          ],
        },
      ],
    },
  },

  // 3. INFRASTRUCTURE: implementa contratos de domain; no conoce UI ni casos de uso.
  {
    files: ["src/features/*/infrastructure/**/*.{ts,tsx}", "src/shared/infrastructure/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: layer("application", "presentation"),
              message: "infrastructure solo depende de domain (implements I...Repository).",
            },
            {
              regex: "^(react|react-native|expo-router|zustand)(/|$)|^@tanstack/",
              message: "infrastructure no puede usar librerías de UI ni de estado.",
            },
            UI_ONLY,
            ROUTES,
          ],
        },
      ],
    },
  },

  // 4. PRESENTATION: hooks y stores. No hablan con Supabase directamente.
  {
    files: ["src/features/*/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@supabase/|(^|/)shared/infrastructure/",
              message: "presentation no usa Supabase directamente: pasa por un caso de uso o repositorio.",
            },
            ROUTES,
          ],
        },
      ],
      // Aviso (no error): raíz de composición dentro del hook. Ver observación 1.
      "no-restricted-syntax": [
        "warn",
        {
          selector: "ImportDeclaration[source.value=/infrastructure.repositories/]",
          message:
            "Raíz de composición en el hook. Considera un contenedor DI (src/shared/di/container.ts).",
        },
      ],
    },
  },

  // 5. APP (Expo Router): pantallas y layouts, consumen hooks de presentation.
  {
    files: ["app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: layer("application"),
              message: "Las pantallas no ejecutan casos de uso: usa un hook de presentation.",
            },
          ],
        },
      ],
      // Aviso (no error): acceso directo a infraestructura. Ver observación 3.
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "ImportDeclaration[source.value=/^@supabase|shared.infrastructure|infrastructure.repositories/]",
          message:
            "La pantalla accede a infraestructura. Expón esto desde IAuthRepository + un hook de presentation.",
        },
      ],
    },
  },
]);
