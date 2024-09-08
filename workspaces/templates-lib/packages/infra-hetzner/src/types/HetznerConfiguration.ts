export interface HetznerUserConfig {
  token: string;
}

/**
 * Hetzner user
 *
 * @title Hetzner User
 */
export interface HetznerUser {
  name: string;
  config: HetznerUserConfig;
}

/**
 * Global configuration for deploying to Hetzner.
 *
 * @title Hetzner Configuration
 */
export interface HetznerConfiguration {
  users: HetznerUser[];
}
