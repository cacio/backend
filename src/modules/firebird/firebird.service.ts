import { Injectable, Logger } from '@nestjs/common';
import * as firebird from 'node-firebird';

interface FirebirdConnectionOptions {
    host: string;
    port: number;
    database: string;
    user: string;
    password?: string;
    charset?: string;
    role?: string;
    pageSize?: number;
}

@Injectable()
export class FirebirdService {
  private readonly logger = new Logger(FirebirdService.name);
  private readonly pool: firebird.ConnectionPool;

  constructor() {
    const options: FirebirdConnectionOptions = {
      host: process.env.FIREBIRD_HOST,
      port: Number(process.env.FIREBIRD_PORT),
      database: process.env.FIREBIRD_DATABASE,
      user: process.env.FIREBIRD_USER,
      password: process.env.FIREBIRD_PASSWORD,
      charset: 'UTF8',
    };

    this.pool = firebird.pool(5, options); // Cria um pool com 5 conexões
  }

  private getConnection(): Promise<firebird.Database> {
    return new Promise((resolve, reject) => {
      this.pool.get((err, db) => {
        if (err) {
          this.logger.error('Erro ao obter conexão do pool', err);

          reject(err);
        } else {
          resolve(db);
        }
      });
    });
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    let db: firebird.Database | null = null;
    try {
      db = await this.getConnection();
      return new Promise<T[]>((resolve, reject) => {
        db.query(sql, params, (err, rows) => {
          if (err) {
            this.logger.error(`Erro na query Firebird: ${sql}`, err);
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    } catch (error) {
      this.logger.error('Erro na query: ', error);
      throw error;
    } finally {
      if (db) {
        db.detach();
      }
    }
  }
}
