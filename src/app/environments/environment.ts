// src/environments/environment.ts
export const environment = {
  production: false,
  // Usando proxy do Angular em dev:
  //   - /auth  -> http://localhost:8080
  //   - /api   -> http://localhost:8080
  // Mantemos apiUrl vazio para montar URLs relativas corretas:
  //   POST /auth/login   (sem /api)
  apiUrl: ''
};