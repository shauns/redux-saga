// @flow
import { sym, is, kTrue, ident, check, TASK } from './utils'


export const CALL_FUNCTION_ARG_ERROR = "call/cps/fork first argument must be a function, an array [context, function] or an object {context, fn}"
export const FORK_ARG_ERROR   = "fork first argument must be a generator function or an iterator"
export const JOIN_ARG_ERROR   = "join argument must be a valid task (a result of a fork)"
export const CANCEL_ARG_ERROR = "cancel argument must be a valid task (a result of a fork)"
export const INVALID_PATTERN  = "Invalid pattern passed to `take` (HINT: check if you didn't mispell a constant)"
export const SELECT_ARG_ERROR = "select first argument must be a function"


const IO      = sym('IO')
const TAKE    = 'TAKE'
const PUT     = 'PUT'
const RACE    = 'RACE'
const CALL    = 'CALL'
const CPS     = 'CPS'
const FORK    = 'FORK'
const JOIN    = 'JOIN'
const CANCEL  = 'CANCEL'
const SELECT  = 'SELECT'

type Effect<T> = {
  [x: string]: T
};

type EffectFactory<T> = (type: string, payload: T) => Effect<T>

const effect: EffectFactory = (type, payload) => ({ [IO]: true, [type]: payload })

const matchers = {
  wildcard  : () => kTrue,
  default   : pattern => input => input.type === pattern,
  array     : patterns => input => patterns.some( p => p === input.type ),
  predicate : predicate => input => predicate(input)
}

type MatchPattern = any;

type Action = any;

export function matcher(pattern: MatchPattern): (v: Action) => boolean {
  return (
      pattern === '*'   ? matchers.wildcard
    : is.array(pattern) ? matchers.array
    : is.func(pattern)  ? matchers.predicate
    : matchers.default
  )(pattern)
}

export function take<MatchPattern>(pattern: MatchPattern): Effect<MatchPattern> {
  if (arguments.length > 0 && is.undef(pattern)) {
    throw new Error(INVALID_PATTERN)
  }

  return effect(TAKE, is.undef(pattern) ? '*' : pattern)
}

export function put<T>(action: T): Effect<T> {
  return effect(PUT, action)
}

export function race<T>(effects: T): Effect<T> {
  return effect(RACE, effects)
}

type FnCallDesc = {
  context: ?any,
  fn: function,
  args: any[],
};

function getFnCallDesc(fn: any, args: any[]): FnCallDesc {
  check(fn, is.notUndef, CALL_FUNCTION_ARG_ERROR)

  let context = null

  if(is.array(fn)) {
    [context, fn] = fn
  } else if(fn.fn) {
    ({context, fn} = fn)
  }
  check(fn, is.func, CALL_FUNCTION_ARG_ERROR)

  return {context, fn, args}
}

export function call(fn: () => any, ...args: any[]): Effect {
  return effect(CALL, getFnCallDesc(fn, args))
}

export function apply(context: any, fn: () => any, args: any[] = []): Effect {
  return effect(CALL, getFnCallDesc({context, fn}, args))
}

export function cps(fn: () => any, ...args: any[]): Effect {
  return effect(CPS, getFnCallDesc(fn, args))
}

export function fork(fn: () => any, ...args: any[]): Effect {
  return effect(FORK, getFnCallDesc(fn, args))
}

const isForkedTask = task => task[TASK]

type TaskDesc = Object

export function join(taskDesc: TaskDesc): Effect<TaskDesc> {
  if(!isForkedTask(taskDesc))
    throw new Error(JOIN_ARG_ERROR)

  return effect(JOIN, taskDesc)
}

export function cancel(taskDesc: TaskDesc): Effect<TaskDesc> {
  if(!isForkedTask(taskDesc))
    throw new Error(CANCEL_ARG_ERROR)

  return effect(CANCEL, taskDesc)
}

export function select(selector?: any, ...args: any[]): Effect {
  if(arguments.length === 0) {
    selector = ident
  } else {
    check(selector, is.func, SELECT_ARG_ERROR)
  }
  return effect(SELECT, {selector, args})
}


export const asEffect = {
  take    : (effect => effect && effect[IO] && effect[TAKE]: (effect: Effect) => ?Effect),
  put     : (effect => effect && effect[IO] && effect[PUT]: (effect: Effect) => ?Effect),
  race    : (effect => effect && effect[IO] && effect[RACE]: (effect: Effect) => ?Effect),
  call    : (effect => effect && effect[IO] && effect[CALL]: (effect: Effect) => ?Effect),
  cps     : (effect => effect && effect[IO] && effect[CPS]: (effect: Effect) => ?Effect),
  fork    : (effect => effect && effect[IO] && effect[FORK]: (effect: Effect) => ?Effect),
  join    : (effect => effect && effect[IO] && effect[JOIN]: (effect: Effect) => ?Effect),
  cancel  : (effect => effect && effect[IO] && effect[CANCEL]: (effect: Effect) => ?Effect),
  select  : (effect => effect && effect[IO] && effect[SELECT]: (effect: Effect) => ?Effect)
}
