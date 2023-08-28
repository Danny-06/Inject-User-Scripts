import { useEffect } from '../hooks.mjs';

export default function useEffectOnce(callback) {
  return useEffect(callback, [])
}
