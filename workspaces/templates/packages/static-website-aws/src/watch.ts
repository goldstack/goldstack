#!/usr/bin/env node

import { init } from './gulp';

const watch = async (args: string[]): Promise<void> => {
  const gulp = await init(args);
  await new Promise<void>((resolve) => {
    gulp.series(['watch'])(resolve as any);
  });
};

watch(process.argv);
