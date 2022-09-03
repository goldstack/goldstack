import { mkdir, read, rm, rmSafe, write } from '@goldstack/utils-sh';
import { dirname } from 'path';
import { StaticFileMapper, StaticFileMapping } from 'static-file-mapper';

import { createHash } from 'crypto';

export type MappingStore = StaticFileMapping[];

/**
 * Allows defining static file mappings during build.
 */
export interface StaticFileMapperManager extends StaticFileMapper {
  put({
    name,
    generatedName,
    content,
  }: {
    name: string;
    generatedName: string;
    content: string;
  }): Promise<void>;
  remove({ name }: { name: string }): Promise<void>;
  reset(): Promise<void>;
  resolve({ name }: { name: string }): Promise<string>;
}

export class StaticFileMapperBuild implements StaticFileMapperManager {
  private dir: string;
  private storePath: string;

  private createContentHash(content: string): string {
    const hash = createHash('md5').update(content).digest('hex');
    return hash;
  }

  private readStore(): MappingStore {
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

    const store = this.readStore();

    let mappingExists = false;
    store.map((mapping) => {
      if (mapping.names.find((el) => el === name)) {
        // clear out replaced file locally
        // should still continue to exist in S3
        // bucket
        if (mapping.generatedName !== hashedName) {
          rm('-f', `${this.dir}/${mapping.generatedName}`);
          mapping.generatedName = hashedName;
        }
        mappingExists = true;
      }
    });

    if (!mappingExists) {
      // check if there is an entry for the generated name
      const existingElement = store.find(
        (el) => el.generatedName === hashedName
      );
      if (existingElement) {
        existingElement.names.push(name);
      } else {
        store.push({
          names: [name],
          generatedName: hashedName,
        });
      }
    }

    this.writeStore(store);
  }

  public async remove({ name }: { name: string }): Promise<void> {
    let store = this.readStore();
    const element = store.find((el) => el.names.find((el) => el === name));
    if (element) {
      element.names = element.names.filter((el) => el !== name);

      if (element.names.length === 0) {
        store = store.filter((el) => {
          return el.generatedName !== element.generatedName;
        });
        // clear out removed file locally
        // should still continue to exist in S3
        // bucket
        rm('-f', `${this.dir}/${element.generatedName}`);
      }
    }
    this.writeStore(store);
  }

  public async resolve({ name }: { name: string }): Promise<string> {
    const store = this.readStore();

    const mapping = store.find((mapping) =>
      mapping.names.find((el) => el === name)
    );
    if (!mapping) {
      throw new Error(`Cannot find static file mapping for ${name}`);
    }
    return mapping.generatedName;
  }

  public async has({ name }: { name: string }): Promise<boolean> {
    const store = this.readStore();

    const mapping = store.find((mapping) =>
      mapping.names.find((el) => el === name)
    );

    return !!mapping;
  }

  public async reset(): Promise<void> {
    this.writeStore([]);
    await rmSafe(this.dir);
  }

  constructor({ dir, storePath }: { dir: string; storePath: string }) {
    this.dir = dir;
    this.storePath = storePath;
  }
}
