import type { MaxBounds } from '../types';

/** Default geographic and projected bounds for Great Britain. */
export const defaultMaxBounds: MaxBounds = {
  projected: [
    [0.0, 0.0],
    [699999.9, 1299999.9]
  ],
  geographic: [
    [-8.74, 49.84],
    [1.96, 60.9]
  ]
};
