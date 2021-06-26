#!/usr/bin/env node
import { init } from './gulp';

const build = async (args: string[]): Promise<void> => {
  const gulp = await init(args);
  await new Promise<void>((resolve) => {
    gulp.series(['build'])(resolve);
  });
};

build(process.argv);
