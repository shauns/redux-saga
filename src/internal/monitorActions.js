// @flow
export const MONITOR_ACTION = 'MONITOR_ACTION'
export const EFFECT_TRIGGERED = 'EFFECT_TRIGGERED'
export const EFFECT_RESOLVED = 'EFFECT_RESOLVED'
export const EFFECT_REJECTED = 'EFFECT_REJECTED'

type MonitorAction = {
  [x: string]: boolean;
  type: string;
}

export function effectTriggered(effectId: any, parentEffectId: any, label: any, effect: any): MonitorAction {
  return {
    [MONITOR_ACTION]: true,
    type: EFFECT_TRIGGERED,
    effectId, parentEffectId, label, effect
  }
}

export function effectResolved(effectId: any, result: any): MonitorAction {
  return {
    [MONITOR_ACTION]: true,
    type: EFFECT_RESOLVED,
    effectId, result
  }
}

export function effectRejected(effectId: any, error: any): MonitorAction {
  return {
    [MONITOR_ACTION]: true,
    type: EFFECT_REJECTED,
    effectId, error
  }
}
