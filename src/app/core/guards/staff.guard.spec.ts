import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { staffGuard } from './staff.guard';

describe('staffGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => staffGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
