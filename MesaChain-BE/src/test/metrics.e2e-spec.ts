import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Metrics Controller (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/metrics (GET)', () => {
    return request(app.getHttpServer())
      .get('/metrics')
      .expect(200)
      .expect((res) => {
        expect(res.text).toContain('# HELP');
        expect(res.text).toContain('# TYPE');
        expect(res.text).toContain('http_requests_total');
        expect(res.text).toContain('http_request_duration_seconds');
      });
  });

  it('/metrics should return prometheus format', () => {
    return request(app.getHttpServer())
      .get('/metrics')
      .expect(200)
      .expect('Content-Type', /text\/plain/)
      .expect((res) => {
        // Check for basic Prometheus metrics format
        const lines = res.text.split('\n');
        const hasHelp = lines.some(line => line.startsWith('# HELP'));
        const hasType = lines.some(line => line.startsWith('# TYPE'));
        const hasMetrics = lines.some(line => !line.startsWith('#') && line.includes('{'));
        
        expect(hasHelp).toBe(true);
        expect(hasType).toBe(true);
        expect(hasMetrics).toBe(true);
      });
  });

  it('/metrics should include process metrics', () => {
    return request(app.getHttpServer())
      .get('/metrics')
      .expect(200)
      .expect((res) => {
        expect(res.text).toContain('process_cpu_seconds_total');
        expect(res.text).toContain('process_resident_memory_bytes');
        expect(res.text).toContain('nodejs_version_info');
      });
  });
}); 