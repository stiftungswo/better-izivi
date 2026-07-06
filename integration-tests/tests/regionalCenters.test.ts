import { client } from '../src/client';
import { BOOTSTRAP_REGIONAL_CENTER_SHORT_NAME } from '../src/fixtures';

describe('GET /v1/regional_centers', () => {
  it('publicly lists regional centers, including the bootstrapped one', async () => {
    const response = await client.get('/v1/regional_centers');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThanOrEqual(1);

    for (const center of response.data) {
      expect(Object.keys(center).sort()).toEqual(['address', 'id', 'name', 'short_name']);
    }

    expect(response.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ short_name: BOOTSTRAP_REGIONAL_CENTER_SHORT_NAME })])
    );
  });
});
