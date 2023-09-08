import { useRef } from '../hooks.mjs';

/**
 * 
 * @param {(value, ref) => void} refCallback 
 * @returns {{current: value, refCallback: (value) => void}}
 */
export default function useRefCallback(callback) {
  const ref = useRef(null)

  const refCallback = node => {
    if (!node) {
      return
    }

    callback(node, ref)
  }

  return {
    get current() {
      return ref.current
    },
    refCallback
  }
}
