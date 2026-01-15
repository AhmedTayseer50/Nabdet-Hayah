import { TestBed } from '@angular/core/testing';

import { SessionRequestsService } from './session-requests.service';

describe('SessionRequestsService', () => {
  let service: SessionRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
