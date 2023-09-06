export default class MouseInfo {

  #abortController = new AbortController()

  // Cancel the current instance of the MouseInfo
  abort() {
    this.#abortController.abort()
    MouseInfo.#instance = null
  }

  constructor() {
    // Allow just one instance of the object
    if (MouseInfo.#instance == null) MouseInfo.#instance = this
    else return MouseInfo.#instance

    const {signal} = this.#abortController

    // Set: mouse.isDown = false
    window.addEventListener('mouseup',     this.pointerUp.bind(this), {capture: true, signal})
    window.addEventListener('contextmenu', this.pointerUp.bind(this), {capture: true, signal})
    window.addEventListener('touchend',    this.pointerUp.bind(this), {capture: true, signal})
    window.addEventListener('dragend',     this.dragEnd.bind(this),   {signal})

    // Set: mouse.isDown = true
    // Set: mouse.target = evt.target
    // Set: mouse.elementMouseOffsetX = event.clientX - rect.x
    // Set: mouse.elementMouseOffsetX = event.clientX - rect.x
    // Set: mouse.previousClientX = event.clientX
    // Set: mouse.previousClientY = event.clientY
    window.addEventListener('mousedown',  this.pointerDown.bind(this), {capture: true, signal})
    window.addEventListener('touchstart', this.pointerDown.bind(this), {capture: true, signal})

    // Set: mouse.previousClientX = event.clientX
    // Set: mouse.previousClientY = event.clientY
    window.addEventListener('touchmove', this.pointerMove.bind(this), {signal})
    window.addEventListener('mousemove', this.pointerMove.bind(this), {signal})
  }

  static #instance = null

  isDown = false
  mouseDownButton = null

  isTouch = null

  // Get mouse position inside element
  elementMouseOffsetX = null
  elementMouseOffsetY = null

  // Reference to the current element that was clicked
  target = null

  path = []

  // window values
  previousClientX = null
  previousClientY = null

  ctrlKey  = false
  shiftKey = false
  altKey   = false

  pointerMove(evt) {
    const event = evt.touches ? evt.touches[0] : evt

    this.previousClientX = event.clientX
    this.previousClientY = event.clientY
  }

  pointerDown(evt) {
    this.isDown = true;

    this.isTouch = evt.touches ? true : false

    this.mouseDownButton = evt.button ?? 0

    this.target = evt.target
    this.path   = evt.composedPath()

    const event = evt.touches ? evt.touches[0] : evt

    const rect = this.target.getBoundingClientRect()

    this.elementMouseOffsetX = event.clientX - rect.x
    this.elementMouseOffsetY = event.clientY - rect.y

    this.previousClientX = event.clientX
    this.previousClientY = event.clientY
  }

  pointerUp(evt) {
    if(evt.type === 'mousedown' && evt.button !== 0) return

    this.target = evt.target
    this.path   = evt.composedPath()

    this.isDown = false
  }

  dragEnd() {
    this.isDown = false
  }

}
