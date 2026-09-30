export interface HealthStatus {
  status: string;
  app: string;
  version: string;
  environment: string;
}

export interface ReadyStatus {
  status: string;
  database: string;
}

export interface ApiError {
  code: string;
  message: string;
  status?: number;
}

export interface NavRoute {
  name: string;
  path: string;
}

export * from './content';
