// src/types/api.ts
import { User } from './models';

/**
 * Generic API response wrapper.
 * NOTE: The backend returns payloads directly (e.g. { token, user }),
 * NOT wrapped in { success, data }. The Axios response interceptor
 * in client.ts does `return response.data`, so service calls resolve
 * with the raw backend payload.
 *
 * Use this type only if an endpoint explicitly wraps its response.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Standardized Error Response
 * Matches: { "success": false, "message": "...", "errors": [] }
 */
export interface ApiError {
  success: boolean;
  message: string;
  errors: any[];
  status?: number;
}

/**
 * Response from POST /auth/login
 * Backend returns { token, user } directly (no envelope wrapper).
 * After the Axios interceptor unwraps, this is what you get.
 */
export interface LoginResponse {
  token: string;
  user: User;
}