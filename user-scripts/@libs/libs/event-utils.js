//@ts-check

/**
 * @typedef EventOptions
 * 
 * Native event options
 * @property {boolean} [capture=true]
 * @property {boolean} [passive]
 * @property {boolean} [once=false]
 * @property {AbortSignal} [signal]
 * 
 * Custom event options
 * @property {boolean} [runImmediately=false]
 */

/**
 * 
 * @param {EventTarget} target 
 * @param {(event: Event) => any} listener 
 * @param {string} eventType 
 * @param {EventOptions} options 
 * @returns {() => void} Clean up callback to remove the listener
 */
export function addEventListener(target, eventType, listener, options = {}) {
  const nativeEventOptions = {
    capture: options?.capture,
    passive: options?.passive,
    once: options?.once,
    signal: options?.signal,
  }

  target.addEventListener(eventType, listener, nativeEventOptions)

  if (options.runImmediately) {
    listener.call(target, new Event(eventType))
  }

  return () => {
    target.removeEventListener(eventType, listener, nativeEventOptions)
  }
}


/**
 * 
 * @template {new(eventName: string, eventInitDict?: EventInit | undefined) => Event} T
 * @param {EventTarget} target 
 * @param {T} EventConstructor 
 * @param {ConstructorParameters<T>[0]} name 
 * @param {ConstructorParameters<T>[1]} [init] 
 * @returns {boolean}
 */
export function dispatchEvent(target, EventConstructor, name, init = undefined) {
  const event = new EventConstructor(name, init)

  return target.dispatchEvent(event)
}
