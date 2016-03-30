// @flow
import { remove } from './utils'

export default function emitter(): {
  subscribe: (cb: (item: any) => any) => function,
  emit: (item: any) => void,
} {

  const cbs = []

  function subscribe(cb: (item: any) => any ): any {
    cbs.push(cb)
    return () => remove(cbs, cb)
  }

  function emit(item: any) {
    cbs.slice().forEach(cb => cb(item))
  }

  return {
    subscribe,
    emit
  }
}
