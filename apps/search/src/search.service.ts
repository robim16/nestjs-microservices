import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  ping() {
    return {
      ok: true,
      service: 'media',
      now: new Date().toISOString(),
    };
  }
}
