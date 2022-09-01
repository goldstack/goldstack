export interface StaticFileMapping {
  name: string;
  generatedName: string;
}

export type MappingStore = StaticFileMapping[];

/**
 * Allows resolving static file mappings.
 */
export interface StaticFileMapper {
  resolve({ name }: { name: string }): Promise<string>;
  has({ name }: { name: string }): Promise<boolean>;
}

export class StaticFileMapperRun implements StaticFileMapper {
  private store: MappingStore;
  private baseUrl: string;

  private readStore(): MappingStore {
    return this.store;
  }

  public async has({ name }: { name: string }): Promise<boolean> {
    const store = this.readStore();

    const mapping = store.find((mapping) => mapping.name === name);

    return !!mapping;
  }

  public async resolve({ name }: { name: string }): Promise<string> {
    const store = this.readStore();

    const mapping = store.find((mapping) => mapping.name === name);
    if (!mapping) {
      throw new Error(`Cannot find static file mapping for ${name}`);
    }
    return `${this.baseUrl}${mapping.generatedName}`;
  }

  constructor({ store, baseUrl }: { store: MappingStore; baseUrl: string }) {
    this.store = store;
    this.baseUrl = baseUrl;
  }
}
