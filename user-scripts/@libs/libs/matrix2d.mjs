export default class Matrix2D {

	constructor(sizeX, sizeY) {
		this.#array2D = Array.from({length: sizeY}, () => {
			return Object.preventExtensions(Array.from({length: sizeX}, () => null))
		})

		Object.freeze(this.#array2D)
	}

	#array2D

	static from(array2D) {
		const sizeX = array2D[0].length
		const sizeY = array2D.length

		const matrix = new Matrix2D(sizeX, sizeY)

		matrix.#array2D = Matrix2D.cloneArray2D(array2D)

		return matrix
	}

	static createArray2D(sizeX, sizeY) {
		return Object.freeze(
			Array.from({length: sizeY}, (value, index) => {
			  return Object.preventExtensions(Array.from({length: sizeX}))
		  })
		)
	}

	static cloneArray2D(array2D) {
		const sizeX = array2D[0].length
		const sizeY = array2D.length

		return Object.freeze(
			Array.from({length: sizeY}, (valueY, y) => {
			  return Object.preventExtensions(Array.from({length: sizeX}, (valueX, x) => array2D[y][x]))
		  })
		)
	}

	static rowsToColumns(array2D) {
		const sizeX = array2D[0].length
		const sizeY = array2D.length

		const transformedArray2D = this.createArray2D(sizeY, sizeX)

		for (let y = 0; t < sizeY; y++) {
			for (let x = 0; x < sizeX; x++) {
				transformedArray2D[x][y] = array2D[y][x] ?? null
			}
		}

		return transformedArray2D
	}

	*[Symbol.iterator]() {
		for (let y = 0; y < this.sizeY; y++) {
			for (let x = 0; x < this.sizeX; x++) {
				const value = this.#array2D[y][x]

				yield { value, x, y }
			}
		}
	}

	iterator() {
		return this[Symbol.iterator]()
	}

	/**
	 * Size of the matrix in the X axis
   */
	get sizeX() {
		return this.#array2D[0].length
	}

  /**
   * Size of the matrix in the Y axis
   */
	get sizeY() {
		return this.#array2D.length
	}

	log() {
		console.table(this.#array2D)
	}

	get size() {
		return this.sizeX * this.sizeY
	}


	getItem(positionX, positionY) {
		return this.#array2D[positionY][positionX]
	}

	setItem(item, positionX, positionY) {
		this.#array2D[positionY][positionX] = item
	}

	removeItem(positionX, positionY) {
		const oldItem = this.#array2D[positionY][positionX]
		this.#array2D[positionY][positionX] = null

		return oldItem
	}

  replaceItem(item, positionX, positionY) {
		const oldItem = this.#array2D[positionY][positionX]
		this.#array2D[positionY][positionX] = item

		return oldItem
	}

	moveXBy(positionX, positionY, steps) {
		const currentItem = this.#array2D[positionY][positionX]
		const replacedItem = this.#array2D[positionY + steps][positionX]

		this.#array2D[positionY + steps][positionX] = currentItem

		return replacedItem
	}

	moveYBy(positionX, positionY, steps) {
		const currentItem = this.#array2D[positionY][positionX]
		const replacedItem = this.#array2D[positionY][positionX + steps]

		this.#array2D[positionY][positionX + steps] = currentItem

		return replacedItem
	}

	moveXYBy(positionX, positionY, stepsX, stepsY) {
		const currentItem = this.#array2D[positionY][positionX]
		const replacedItem = this.#array2D[positionY + stepsY][positionX + stepsX]

		this.#array2D[positionY + stepsY][positionX + stepsX] = currentItem

		return replacedItem
	}

	moveXTo(positionX, positionY, endPositionX) {
		const currentItem = this.#array2D[positionY][positionX]
		const replacedItem = this.#array2D[positionY][endPositionX]

		this.#array2D[positionY][endPositionX] = currentItem

		return replacedItem
	}

	moveYTo(positionX, positionY, endPositionY) {
		const currentItem = this.#array2D[positionY][positionX]
		const replacedItem = this.#array2D[endPositionY][positionX]

		this.#array2D[endPositionY][positionY] = currentItem

		return replacedItem
	}

	moveXYTo(positionX, positionY, endPositionX, endPositionY) {
		const currentItem = this.#array2D[positionY][positionX]
		const replacedItem = this.#array2D[endPositionY][endPositionX]

		this.#array2D[endPositionY][endPositionX] = currentItem

		return replacedItem
	}

	swapItems(positionX1, positionY1, positionX2, positionY2) {
		const tempSwapStore = this.#array2D[positionY2][positionX2]

		this.#array2D[positionY2][positionX2] = this.#array2D[positionY1][positionX1]
		this.#array2D[positionY1][positionX1] = tempSwapStore
	}

	translateXColumn(positionX, stepsX) {
		const singleStepX = stepsX / Math.abs(stepsX)

		for (let x = positionX; x !== positionX + stepsX; x += singleStepX) {
			for (let y = 0; y < this.sizeY; y++) {
			  this.swapItems(x, y, x + singleStepX, y)
   		}
		}
	}

	translateYRow(positionY, stepsY) {
		const singleStepY = stepsY / Math.abs(stepsY)

		for (let y = positionY; y !== positionY + stepsY; y += singleStepY) {
			for (let x = 0; x < this.sizeX; x++) {
			  this.swapItems(x, y, x, y + singleStepY)
   		}
		}
	}

	translateXColumnTo(positionX, positionXTo) {
		this.translateXColumn(positionX, positionXTo - positionX)
	}

	translateYRowTo(positionY, positionYTo) {
		this.translateXColumn(positionY, positionYTo - positionY)
	}

	swapXColumns(positionX, columnIndexX) {
		for (let y = 0; y < this.sizeY; y++) {
			this.swapItems(positionX, y, columnIndexX, y)
		}
	}

	swapYRows(positionY, columnIndexY) {
		for (let x = 0; x < this.sizeX; x++) {
			this.swapItems(x, positionY, x, columnIndexY)
		}
	}

}

// const m = Matrix2D.from([
// 	['a', 'b', 'c', 'd'],
// 	['e', 'f', 'g', 'h'],
// 	['i', 'j', 'k', 'l'],
// 	['m', 'n', 'ñ', 'o']
// ])
