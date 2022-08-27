import { mkdir, read, write } from '@goldstack/utils-sh';
import { dirname } from 'path';

export interface StaticFileMapping {
  name: string;
  generatedName: string;
}

export type MappingStore = StaticFileMapping[];

export class StaticFileMapper {
  private dir: string;
  private storePath: string;

  private readStore(): MappingStore {
    return JSON.parse(read(this.storePath));
  }

  private writeStore(store: MappingStore): void {
    write(JSON.stringify(store, null, 2), this.storePath);
  }

  public async register({
    name,
    generatedName,
  }: {
    name: string;
    generatedName: string;
  }): Promise<void> {
    const store = this.readStore();

    let found = false;
    store.map((mapping) => {
      if (mapping.name === name) {
        mapping.generatedName = generatedName;
        found = true;
      }
    });
    if (!found) {
      store.push({
        name,
        generatedName,
      });
    }
    this.writeStore(store);
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
    const path = `${this.dir}/${generatedName}`;
    mkdir('-p', dirname(path));
    write(content, path);
    await this.register({ name, generatedName });
  }

  public async resolve({ name }: { name: string }): Promise<string> {
    const store = this.readStore();

    const mapping = store.find((mapping) => mapping.name === name);
    if (!mapping) {
      throw new Error(`Cannot find static file mapping for ${name}`);
    }
    return mapping.generatedName;
  }

  constructor({ dir, storePath }: { dir: string; storePath: string }) {
    this.dir = dir;
    this.storePath = storePath;
  }
}
