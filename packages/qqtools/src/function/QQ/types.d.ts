export interface AuthResponse {
  code: number;
  session: string;
}

export interface VerifyResponse {
  code: number;
  msg: string;
}

export interface ReleaseResponse {
  code: number;
  msg: string;
}