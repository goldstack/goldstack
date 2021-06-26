export interface CloudProvider {
  generateEnvVariableString: () => string;
  setEnvVariables: () => void;
}
