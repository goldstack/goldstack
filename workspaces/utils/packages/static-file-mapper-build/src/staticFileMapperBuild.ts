import { mkdir, read, rmSafe, write } from '@goldstack/utils-sh';
import { dirname } from 'path';
import { StaticFileMapper } from 'static-file-mapper';
export interface StaticFileMapping {
  name: string;
  generatedName: string;
}

import { createHash } from 'crypto';

export type MappingStore = StaticFileMapping[];

export class StaticFileMapperBuild implements StaticFileMapper {
  private dir: string;
  private storePath: string | undefined;
  private store: MappingStore | undefined;

  private createContentHash(content: string): string {
    const hash = createHash('md5').update(content).digest('hex');
    return hash;
  }

  private readStore(): MappingStore {
    if (this.store) {
      return this.store;
    }
    if (this.storePath) {
      return JSON.parse(read(this.storePath));
    }
    throw new Error('Cannot read static file mapper store');
  }

  private writeStore(store: MappingStore): void {
    if (!this.storePath) {
      throw new Error('Cannot write static file mapper store');
    }
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

    const hashedName = generatedName;

    let found = false;
    store.map((mapping) => {
      if (mapping.name === name) {
        mapping.generatedName = hashedName;
        found = true;
      }
    });
    if (!found) {
      store.push({
        name,
        generatedName: hashedName,
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
    let hashedName = generatedName;

    if (hashedName.indexOf('[hash]') !== -1) {
      const hash = this.createContentHash(content);
      hashedName = hashedName.replace('[hash]', hash);
    }
    const path = `${this.dir}/${hashedName}`;

    mkdir('-p', dirname(path));
    write(content, path);
    await this.register({ name, generatedName: hashedName });
  }

  public async resolve({ name }: { name: string }): Promise<string> {
    const store = this.readStore();

    const mapping = store.find((mapping) => mapping.name === name);
    if (!mapping) {
      throw new Error(`Cannot find static file mapping for ${name}`);
    }
    return mapping.generatedName;
  }

  public async reset(): Promise<void> {
    this.writeStore([]);
    await rmSafe(this.dir);
  }

  constructor({
    dir,
    storePath,
    store,
  }: {
    dir: string;
    storePath?: string;
    store?: MappingStore;
  }) {
    this.dir = dir;
    this.storePath = storePath;
    this.store = store;
  }
}
