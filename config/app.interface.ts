export interface App {
  port: number | 3000;
  jwtSecret: string;
  database: DatabaseConfig;
  redis: RedisConfig;
}

export type DatabaseConfig = {
  name: string;
  host: string | 'localhost';
  port: number | 5432;
  username: string;
  password: string;
};

export type RedisConfig = {
  host: string | 'localhost';
  port: number | 6379;
  username: string;
  password: string;
};
