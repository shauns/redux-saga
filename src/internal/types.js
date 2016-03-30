/* @flow */
export type Task<T> = {
  done: Promise<T>,
  isRunning: () => boolean,
  result: () => ?T,
  error: () => any,
  cancel: () => void,
};
