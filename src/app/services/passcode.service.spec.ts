import { TestBed } from '@angular/core/testing';

import { PasscodeService } from './passcode.service';

describe('PasscodeService', () => {
  let service: PasscodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasscodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
