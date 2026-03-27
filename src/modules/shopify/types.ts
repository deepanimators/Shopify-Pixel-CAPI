export interface InstallStart {
  shop: string;
  state: string;
  installUrl: string;
}

export interface AuthCallbackResult {
  shop: string;
  state: string;
  accessToken?: string;
  status: "installed" | "pending_configuration";
}
