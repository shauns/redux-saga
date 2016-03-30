// @flow
import { sym, is, check, noop, warnDeprecated } from './utils'
import proc from './proc'
import emitter from './emitter'
import type {Task} from './types';

export const NOT_ITERATOR_ERROR = "runSaga must be called on an iterator"

/**
  @deprecated
  ATTENTION! this method can have some potential issues
  For more infos, see issue https://github.com/yelouafi/redux-saga/issues/48

  memoize the result of storeChannel. It avoids monkey patching the same store
  multiple times unnecessarly. We need only one channel per store
**/
const IO = sym('IO')
export function storeIO(store: any): any {

  warnDeprecated(`storeIO is deprecated, to run Saga dynamically, use 'run' method of the middleware`)

  if(store[IO])
    return store[IO]

  const storeEmitter = emitter()
  const _dispatch = store.dispatch
  store.dispatch = action => {
    const result = _dispatch(action)
    storeEmitter.emit(action)
    return result
  }

  store[IO] = {
    subscribe: storeEmitter.subscribe,
    dispatch : store.dispatch,
    getState : store.getState
  }

  return store[IO]
}

export function runSaga(
  iterator: Iterator,
  {
    subscribe,
    dispatch,
    getState
  }: {
    subscribe: (cb: function) => function,
    dispatch: (output: any) => any,
    getState: () => any,
  },
  monitor: function = noop
): Task {

  check(iterator, is.iterator, NOT_ITERATOR_ERROR)

  return proc(
    iterator,
    subscribe,
    dispatch,
    getState,
    monitor
  )
}
