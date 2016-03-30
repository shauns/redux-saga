// @flow
export const sym: (id: string) => string = id => `@@redux-saga/${id}`

export const TASK  = sym('TASK')
export const kTrue: () => boolean = () => true
export const noop = () => {}
export function ident<T>(v: T): T {
  return v
}

export const isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development'

export function check<T>(value: T, predicate: (value: T) => boolean, error: string): void {
  if(! predicate(value) )
    throw new Error(error)
}

type Predicate<T> = (v: T) => boolean;

export const is = {
  undef     : (v => v === null || v === undefined: Predicate),
  notUndef  : (v => v !== null && v !== undefined: Predicate),
  func      : (f => typeof f === 'function': Predicate),
  array     : Array.isArray,
  promise   : (p => p && is.func(p.then): Predicate),
  iterator  : (it => it && is.func(it.next) && is.func(it.throw): Predicate),
  task      : (it => it && it[TASK]: Predicate),
}

export function remove<T>(array: Array<T>, item: T): void {
  const index = array.indexOf(item)
  if(index >= 0)
    array.splice(index, 1)
}

interface Deferred {
  resolve(): any;
  reject(): any;
  promise: Promise;
}

export function deferred(props: Object = {}): Deferred {
  let def = {...props}
  const promise = new Promise((resolve, reject) => {
    def.resolve = resolve
    def.reject = reject
  })
  def.promise = promise
  return def
}

export function arrayOfDeffered(length: number): Array<Deferred> {
  const arr = []
  for (var i = 0; i < length; i++) {
    arr.push(deferred())
  }
  return arr
}

export function autoInc(seed: number = 0): () => number {
  return () => ++seed
}

export function asap<T>(action: () => T): Promise<T> {
  return Promise.resolve(1).then( () => action() )
}

/* eslint-disable no-console */
export function warnDeprecated(msg: string) {
  if(isDev) {
    console.warn('DEPRECATION WARNING', msg)
  }
}
