import { TestBed } from '@angular/core/testing';

import { PushnoticeService } from './pushnotice.service';

describe('PushnoticeService', () => {
  let service: PushnoticeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PushnoticeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
