export interface StaticFileMapping {
  name: string;
  generatedName: string;
}

export type MappingStore = StaticFileMapping[];

export interface StaticFileMapper {
  put({
    name,
    generatedName,
    content,
  }: {
    name: string;
    generatedName: string;
    content: string;
  }): Promise<void>;
  reset(): Promise<void>;
  resolve({ name }: { name: string }): Promise<string>;
}

export class StaticFileMapperRun implements StaticFileMapper {
  private store: MappingStore;
  private baseUrl: string;

  private readStore(): MappingStore {
    return this.store;
  }

  private writeStore(store: MappingStore): void {
    throw new Error('Cannot write store with Run file mapper');
  }

  public async put({
    name,
    generatedName,
    content,
  }: {
    name: string;
    generatedName: string;
    content: string;
  }): Promise<void> {
    new Error('Cannot put with Run store');
  }

  public async resolve({ name }: { name: string }): Promise<string> {
    const store = this.readStore();

    const mapping = store.find((mapping) => mapping.name === name);
    if (!mapping) {
      throw new Error(`Cannot find static file mapping for ${name}`);
    }
    return `${this.baseUrl}${mapping.generatedName}`;
  }

  public async reset(): Promise<void> {
    throw new Error('Reset not supported for run stores.');
  }
  constructor({ store, baseUrl }: { store: MappingStore; baseUrl: string }) {
    this.store = store;
    this.baseUrl = baseUrl;
  }
}
