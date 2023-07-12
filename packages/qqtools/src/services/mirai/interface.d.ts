export interface AuthResponse {
  code: number;
  session: string;
}

export interface MessageResponse {
  code: number;
  msg: string;
}

export interface AboutResponse {
  code: number;
  msg?: string;          // v1
  errorMessage?: string; // v2
  data: {
    version: string;
  };
}