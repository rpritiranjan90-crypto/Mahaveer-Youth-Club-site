export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  environment: string;
}

export interface NavRoute {
  path: string;
  name: string;
}
