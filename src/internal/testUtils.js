// @flow
import { TASK } from './utils'

type Task = any;

export function createMockTask(): Task {

  let running = true
  let result, error

  return {
    [TASK]: true,
    isRunning: () => running,
    result: () => result,
    error: () => error,

    setRunning : b => running = b,
    setResult  : r => result = r,
    setError   : e => error = e
  }

}
