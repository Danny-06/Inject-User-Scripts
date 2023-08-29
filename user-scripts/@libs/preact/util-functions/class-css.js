/**
 * @typedef {{[key: string]: boolean | undefined | null}} ClassesMap
 */

/**
 * 
 * @param  {ClassesMap[] | [...string[], ClassesMap]} args 
 * @returns {string | undefined}
 */
export function classCSS(...args) {
  switch (args.length) {
    case 0: return

    case 1: {
      /**@type {[ClassesMap]} */
      const [classesMap] = args

      if (Object.getPrototypeOf(classesMap) !== Object.prototype && Object.getPrototypeOf(classesMap) !== null) {
        throw new TypeError(`When there's only 1 argument, the provided argument must be a plain object with boolean values`)
      }

      let classNameString = ''

      for (const className in classesMap) {
        if (classesMap[className] != null && typeof classesMap[className] !== 'boolean') {
          throw new TypeError(`The values of the object must be booleans. Error in key='${className}'`)
        }

        if (classesMap[className]) {
          classNameString += `${className.trim()} `
        }
      }

      return classNameString.trim()
    }

    default: {
      /**@type {string[]} */
      const classNames = [...args].slice(0, -1)
      /**@type {ClassesMap} */
      const classesMap = args.at(-1)

      if (Object.getPrototypeOf(classesMap) !== Object.prototype && Object.getPrototypeOf(classesMap) !== null) {
        throw new TypeError(`When there are more than 1 argument, the last argument must be a plain object with boolean values`)
      }

      let classNameString = ''

      for (const className of classNames) {
        if (typeof className !== 'string') {
          throw new TypeError('When there are more than 1 argument, all the arguments except the last one must be a string')
        }

        classNameString += `${className.trim()} `
      }

      for (const className in classesMap) {
        if (classesMap[className] != null && typeof classesMap[className] !== 'boolean') {
          throw new TypeError(`The values of the object must be booleans. Error in key='${className}'`)
        }

        if (classesMap[className]) {
          classNameString += `${className.trim()} `
        }
      }

      return classNameString.trim()
    }
  }
}
