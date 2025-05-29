import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfigService {
  constructor(private configService: ConfigService) {}

  getDatabaseUrl(): string {
    const host = this.configService.get<string>('NS_MARIADB_HOST', 'localhost');
    const port = this.configService.get<string>('NS_MARIADB_PORT', '3306');
    const database = this.configService.get<string>('NS_MARIADB_DATABASE', 'finance');
    const user = this.configService.get<string>('NS_MARIADB_USER', 'app');
    const password = this.configService.get<string>('NS_MARIADB_PASSWORD', 'appsecret');

    return `mysql://${user}:${password}@${host}:${port}/${database}`;
  }
} 