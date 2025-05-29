import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfigService {
  private readonly logger = new Logger(DatabaseConfigService.name);

  constructor(private configService: ConfigService) {}

  getDatabaseUrl(): string {
    // Check if DATABASE_URL is directly provided (common in PaaS platforms)
    const directDatabaseUrl = this.configService.get<string>('DATABASE_URL');
    
    if (directDatabaseUrl) {
      this.logger.log('Using DATABASE_URL environment variable');
      this.logger.log(`Database URL: ${this.maskPassword(directDatabaseUrl)}`);
      return directDatabaseUrl;
    }

    // Check for common PaaS database environment variables
    const mysqlUrl = this.configService.get<string>('MYSQL_URL');
    if (mysqlUrl) {
      this.logger.log('Using MYSQL_URL environment variable');
      this.logger.log(`Database URL: ${this.maskPassword(mysqlUrl)}`);
      return mysqlUrl;
    }

    // Fallback to individual environment variables
    const host = this.configService.get<string>('NS_MARIADB_HOSTNAME') || 
                 this.configService.get<string>('DB_HOST') ||
                 this.configService.get<string>('MYSQL_HOST') ||
                 'localhost';
    
    const port = this.configService.get<string>('NS_MARIADB_PORT') || 
                 this.configService.get<string>('DB_PORT') ||
                 this.configService.get<string>('MYSQL_PORT') ||
                 '3306';
    
    const database = this.configService.get<string>('NS_MARIADB_DATABASE') || 
                     this.configService.get<string>('DB_NAME') ||
                     this.configService.get<string>('MYSQL_DATABASE') ||
                     'finance';
    
    const user = this.configService.get<string>('NS_MARIADB_USER') || 
                 this.configService.get<string>('DB_USER') ||
                 this.configService.get<string>('MYSQL_USER') ||
                 'app';
    
    const password = this.configService.get<string>('NS_MARIADB_PASSWORD') || 
                     this.configService.get<string>('DB_PASSWORD') ||
                     this.configService.get<string>('MYSQL_PASSWORD') ||
                     'appsecret';

    // URL encode username and password to handle special characters
    const encodedUser = encodeURIComponent(user);
    const encodedPassword = encodeURIComponent(password);

    const databaseUrl = `mysql://${encodedUser}:${encodedPassword}@${host}:${port}/${database}`;
    
    // Log environment variables for debugging
    this.logger.log('Using individual environment variables');
    this.logger.log(`Database config - Host: ${host}, Port: ${port}, Database: ${database}, User: ${user}`);
    this.logger.log(`Generated database URL: ${this.maskPassword(databaseUrl)}`);
    
    // Log all available environment variables for debugging
    this.logger.log('Available environment variables:');
    const envVars = ['DATABASE_URL', 'MYSQL_URL', 'NS_MARIADB_HOSTNAME', 'DB_HOST', 'MYSQL_HOST', 
                     'NS_MARIADB_PORT', 'DB_PORT', 'MYSQL_PORT', 'NS_MARIADB_DATABASE', 
                     'DB_NAME', 'MYSQL_DATABASE', 'NS_MARIADB_USER', 'DB_USER', 'MYSQL_USER',
                     'NS_MARIADB_PASSWORD', 'DB_PASSWORD', 'MYSQL_PASSWORD'];
    
    envVars.forEach(envVar => {
      const value = this.configService.get<string>(envVar);
      if (value) {
        if (envVar.includes('PASSWORD') || envVar.includes('URL')) {
          this.logger.log(`${envVar}: ***`);
        } else {
          this.logger.log(`${envVar}: ${value}`);
        }
      } else {
        this.logger.log(`${envVar}: (not set)`);
      }
    });
    
    return databaseUrl;
  }

  private maskPassword(url: string): string {
    return url.replace(/:([^:@]+)@/, ':***@');
  }
} 