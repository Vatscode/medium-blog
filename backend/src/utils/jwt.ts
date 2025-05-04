import { sign as jwtSign } from 'hono/jwt'

export interface JWTPayload {
  userId: string;
  [key: string]: string | number | boolean; // Add index signature as required by Hono
}

export const sign = async (payload: JWTPayload, secret: string): Promise<string> => {
  return await jwtSign(payload, secret)
} 