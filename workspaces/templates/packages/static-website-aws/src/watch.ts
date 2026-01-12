#!/usr/bin/env node

import { init } from './gulpInit';

const watch = async (args: string[]): Promise<void> => {
  const gulp = await init(args);
  await new Promise<void>((resolve) => {
    // biome-ignore lint/suspicious/noExplicitAny: Gulp callback type mismatch
    gulp.series(['watch'])(resolve as any);
  });
};

watch(process.argv);
