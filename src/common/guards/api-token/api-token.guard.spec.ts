import { ApiTokenGuard } from './api-token.guard';

describe('ApiTokenGuard', () => {
  it('should be defined', () => {
    expect(new ApiTokenGuard()).toBeDefined();
  });
});
