// @flow
import { is } from './utils'
import { take, fork, cancel } from './io'
import SagaCancellationException from './SagaCancellationException'

const resume = (fnOrValue, arg) => is.func(fnOrValue) ? fnOrValue(arg) : fnOrValue
const done = { done: true }

type FsmIterator = {
  name: string,
  next: (arg: any, error: any) => any,
  throw: (error: any) => any,
};

function fsmIterator(fsm: Object, nextState: string, name: string = 'iterator'): FsmIterator {
  let aborted, updateState

  function next(arg, error) {
    if(aborted)
      return  done

    if(error) {
      aborted = true
      if(!(error instanceof SagaCancellationException))
        throw error
      return done
    } else {
      if(updateState)
        updateState(arg)

      const [output, transition, _updateState] = fsm[nextState]
      updateState = _updateState
      nextState = resume(transition, arg)
      return resume(output, arg)
    }
  }

  const iterator = {
    name,
    next,
    throw: error => next(null, error)
  }
  if(typeof Symbol !== 'undefined') {
    iterator[Symbol.iterator] = () => iterator
  }

  return iterator;
}

export function takeEvery(pattern: any, worker: function, ...args: any[]): FsmIterator {
  const yieldTake = { done: false, value: take(pattern)}
  const yieldFork = action => ({ done: false, value: fork(worker, ...args, action)})

  return fsmIterator({
    'take' : [yieldTake, 'fork'],
    'fork' : [yieldFork, 'take']
  }, 'take', `takeEvery(${pattern}, ${worker.name})`)
}

export function takeLatest(pattern: any, worker: function, ...args: any[]): FsmIterator {
  const yieldTake   = { done: false, value: take(pattern)}
  const yieldFork   = () => ({ done: false, value: fork(worker, ...args, currentAction)})
  const yieldCancel = () => ({ done: false, value: cancel(currentTask)})
  const forkOrCancel = () => currentTask ? 'cancel' : 'fork'

  let currentTask, currentAction
  return fsmIterator({
    'take'   : [ yieldTake, forkOrCancel, action => currentAction = action ],
    'cancel' : [yieldCancel, 'fork'],
    'fork'   : [yieldFork, 'take', task => currentTask = task ]
  }, 'take', `takeLatest(${pattern}, ${worker.name})`)
}
