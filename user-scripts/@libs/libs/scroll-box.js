import MouseInfo from "./mouse-info.js"

const mouse = new MouseInfo()


/**
 * INFO:
 * - This custom element to work needs a 'MouseInfo' instance as a dependency
 *   and it must be saved in variable named 'mouse' in the same scope as this class
 * 
 * Custom Properties accesible for the user:
 * 
 * 
 * --scroll-smooth: 10
 * --scroll-smooth-x
 * --scroll-smooth-y
 * 
 * --scroll-speed: 100        Controls the speed of the scroll (pixel value)
 * --scroll-speed-x
 * --scroll-speed-y
 * 
 * --overflow: auto           (scroll | auto | hidden | none)
 * --overflow-x
 * --overflow-y
 * 
 * --vertical-button-speed:   50
 * --horizontal-button-speed: 50
 * 
 * --drag-scroll-desktop: false
 * --drag-scroll-mobile: true
 * 
 * --drag-scroll-desktop-smooth: 0     Controls how far the scroll goes after dragging
 * --drag-scroll-desktop-smooth-x
 * --drag-scroll-desktop-smooth-y
 * 
 * --drag-scroll-mobile-smooth
 * --drag-scroll-mobile-smooth-x
 * --drag-scroll-mobile-smooth-y
 * 
 * --keyboard-scroll: true     Controls if keyboard can scroll
 */
export class ScrollBox extends HTMLElement {

  #abortController

  // Lyfecycle callbacks

  connectedCallback() {
    if (this.isConnected) this.#initializeListenersAndAnimations()
  }

  disconnectedCallback() {
    this.#abortController.abort()
    cancelAnimationFrame(this.#scrollBarAnimationID)
  }

  static get observedAttributes() { return ['data-styles'] }

  attributeChangedCallback(name, oldValue, newValue) {
    
  }


  /* Util Functions */
  clamp(from, value, to) {
    return Math.max(from, Math.min(value, to))
  }

  getSign(n) {
    if (n < 0) return -1
    return 1
  }

  cutDecimals(number, numberOfDecimalsToKeep) {
    if (number == null || typeof number !== 'number') throw new TypeError('argument 1 must be a number')
    if (numberOfDecimalsToKeep == null || numberOfDecimalsToKeep <= 0) throw new TypeError('argument 2 must be a positive non Zero number')
  
    // const numberLength = number.toString().length
    // const integerLength = parseInt(number).length
    // const decimalLength = numberLength - integerLength
  
    numberOfDecimalsToKeep = 10 ** numberOfDecimalsToKeep
  
    number = parseInt(number * numberOfDecimalsToKeep) / numberOfDecimalsToKeep
  
    return number
  }



  // Custom Methods, Getters and Setters

  // Allow authors to access programmatic scroll
  get _scrollLeft() {return this.#scrollX}
  get _scrollTop()  {return this.#scrollY}

  set _scrollLeft(left) {this.#scrollX = left ?? this.#scrollX}
  set _scrollTop(top)   {this.#scrollY = top  ?? this.#scrollY}

  /**
   * Append css inside the 'shadow-root' with a style tag.
   * Since 'document.adoptedStyleSheets' goes after 'document.styleSheets'
   * authors need to defined higher specificity selectors
   * to override default styles.
   * 
   * @param {string} cssCode
   */ 
  _appendCSS(cssCode) {
    const style = document.createElement('style')
    style.innerHTML = cssCode

    this.shadowRoot.prepend(style)

    return style
  }


  constructor() {

    super()

    try {
      mouse
    } catch(error) {
      throw new ReferenceError('mouse is not defined, this custom element needs a varible defined with that name in the same scope that has a reference to a MouseInfo instance')
    }

    const self = this

    // Allow focus to the custom element to handle arrow keys scroll (setTimeout is to avoid the requirement of custom elements to not gain attributes at construction)
    setTimeout(() => this.tabIndex = -1)

    this.#cs = getComputedStyle(this)

    this.#shadowRoot         = this.attachShadow({mode: 'open'})
    this.#rootContainer      = this.#shadowRoot.appendChild(document.createElement('div'))
    this.#rootContainer.id   = 'root-container'
    this.#rootContainer.part = 'root-container'

    this.#container      = this.#rootContainer.appendChild(document.createElement('div'))
    this.#container.id   = 'container'
    this.#container.part = 'container'
    this.#container.append(document.createElement('slot'))

    this.#scrollY = this.#container.scrollTop
    this.#scrollX = this.#container.scrollLeft


    // Vertical Scrollbar
    this.#verticalScrollbar            = this.#rootContainer.appendChild(document.createElement('div'))
    this.#verticalScrollbar.part       = 'scrollbar-vertical'

    this.#verticalDecrementButton      = this.#verticalScrollbar.appendChild(document.createElement('div'))
    this.#verticalDecrementButton.part = 'button-vertical-decrement'
    
    this.#verticalThumbContainer       = this.#verticalScrollbar.appendChild(document.createElement('div'))
    this.#verticalThumbContainer.part  = 'thumb-vertical-container'
    this.#verticalThumb                = this.#verticalThumbContainer.appendChild(document.createElement('div'))
    this.#verticalThumb.part           = 'thumb-vertical'
    
    this.#verticalIncrementButton      = this.#verticalScrollbar.appendChild(document.createElement('div'))
    this.#verticalIncrementButton.part = 'button-vertical-increment'


    // Horizontal Scrollbar
    this.#horizontalScrollbar          = this.#rootContainer.appendChild(document.createElement('div'))
    this.#horizontalScrollbar.part     = 'scrollbar-horizontal'

    this.#horizontalDecrementButton      = this.#horizontalScrollbar.appendChild(document.createElement('div'))
    this.#horizontalDecrementButton.part = 'button-horizontal-decrement'
    
    this.#horizontalThumbContainer       = this.#horizontalScrollbar.appendChild(document.createElement('div'))
    this.#horizontalThumbContainer.part  = 'thumb-horizontal-container'
    this.#horizontalThumb                = this.#horizontalThumbContainer.appendChild(document.createElement('div'))
    this.#horizontalThumb.part           = 'thumb-horizontal'
    
    this.#horizontalIncrementButton      = this.#horizontalScrollbar.appendChild(document.createElement('div'))
    this.#horizontalIncrementButton.part = 'button-horizontal-increment'


    // Corner Scrollbar
    this.#cornerScrollbar      = this.#rootContainer.appendChild(document.createElement('div'))
    this.#cornerScrollbar.part = 'corner-scrollbar'


    // Constructed StyleSheet
    const cssCode = // css
    `
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    [hidden] {
      display: none !important;
    }

    #root-container.hide-scrollbars [part="scrollbar-horizontal"],
    #root-container.hide-horizontal-scrollbar [part="scrollbar-horizontal"] {
      height: 0 !important;
    }

    #root-container.hide-scrollbars [part="scrollbar-vertical"],
    #root-container.hide-vertical-scrollbar [part="scrollbar-vertical"] {
      width: 0 !important;
    }


    #root-container.hide-vertical-scrollbar [part="corner-scrollbar"] {
      width: 0 !important;
    }

    #root-container.hide-horizontal-scrollbar [part="corner-scrollbar"] {
      height: 0 !important;
    }

    #root-container.hide-scrollbars [part="corner-scrollbar"] {
      width: 0 !important;
      height: 0 !important;
    }

    #container.no-user-interaction {
      pointer-events: none;
      user-select: none;
    }

    :where(:not(:defined)) {
      display: block;
    }

    :host {
      display: block;
      overflow: hidden;

      /* Remove default outline of ':focus-visible' */
      outline: none;

      --scroll-movement: smooth;
      --scroll-smooth: 10;

      --overflow: auto;

      --scroll-speed: 100;

      --vertical-button-speed: 50;
      --horizontal-button-speed: 50;

      --drag-scroll-desktop: false;
      --drag-scroll-desktop-smooth: 0;

      --drag-scroll-mobile: true;
      --drag-scroll-mobile-smooth: 15;

      --keyboard-scroll: true;
    }

    #root-container {
      position: relative;
      width:  100%;
      height: 100%;

      display: grid;
      grid-template: 1fr / 1fr;
    }

    #container {
      /* Disable default behavior of browsers to handle the manipulation of the element with a touchscreen */
      touch-action: none;

      grid-row: 1 / span 1;
      grid-column: 1 / span 1;

      overflow: hidden;
    }

    [part="scrollbar-vertical"],
    [part="scrollbar-horizontal"],
    [part="corner-scrollbar"] {
      user-select: none;
    }

    [part="scrollbar-vertical"],
    [part="scrollbar-horizontal"] {
      background-color: #0b1115;
    }

    [part="scrollbar-vertical"] {
      grid-row:    1 / span 1;
      grid-column: 2 / span 1;

      width: 10px;

      display: flex;
      flex-direction: column;
    }

    [part="scrollbar-horizontal"] {
      grid-row:    2 / span 1;
      grid-column: 1 / span 1;

      height: 5px;

      display: flex;
    }

    [part="button-vertical-increment"],
    [part="button-vertical-decrement"],
    [part="button-horizontal-increment"],
    [part="button-horizontal-decrement"] {
      background-color: #47484c;
      box-shadow: inset #bfbfbf 0 0 5px 0;
    }

    [part="button-vertical-increment"]:hover,
    [part="button-vertical-decrement"]:hover,
    [part="button-horizontal-increment"]:hover,
    [part="button-horizontal-decrement"]:hover {
      background-color: #585d6b;
    }

    [part="button-vertical-increment"]:active,
    [part="button-vertical-decrement"]:active,
    [part="button-horizontal-increment"]:active,
    [part="button-horizontal-decrement"]:active {
      background-color: #6a707f;
    }

    [part="button-vertical-increment"],
    [part="button-vertical-decrement"] {
      width: 100%;
      height: 20px;
    }

    [part="button-vertical-increment"] {
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
    }

    [part="button-vertical-decrement"] {
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
    }

    [part="button-horizontal-increment"] {
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
    }

    [part="button-horizontal-decrement"] {
      border-top-right-radius: 10px;
      border-bottom-right-radius: 10px;
    }

    [part="button-horizontal-increment"],
    [part="button-horizontal-decrement"] {
      width: 20px;
      height: 100%;
    }

    [part="thumb-vertical-container"],
    [part="thumb-horizontal-container"] {
      position: relative;
      flex-grow: 1;
    }

    [part="thumb-vertical"],
    [part="thumb-horizontal"] {
      position: absolute;

      background-color: #34373e;
      border-radius: 10px;
      box-shadow: inset #bfbfbf 0 0 5px 0;
    }

    [part="thumb-vertical"] {
      margin: 0 auto;
      top: 0;
      left: 0;
      right: 0;
    }

    [part="thumb-horizontal"] {
      margin: 0 auto;
      left: 0;
      top: 0;
      bottom: 0;
    }

    [part="thumb-vertical"]:hover,
    [part="thumb-horizontal"]:hover {
      background-color: #23242b;
    }

    [part="thumb-vertical"]:active,
    [part="thumb-horizontal"]:active {
      background-color: #14171b;
    }

    [part="thumb-vertical"] {
      width: 100%;
      height: 0;
    }

    [part="thumb-horizontal"] {
      width: 0;
      height: 100%;
    }

    [part="corner-scrollbar"] {
      grid-row: 2 / span 1;
      grid-column: 2 / span 1;

      background-color: #3c3a3a;
    }
    `
    try {
      const stylesheet = new CSSStyleSheet()
      this.#shadowRoot.adoptedStyleSheets = [stylesheet]
      stylesheet.replace(cssCode)
    } catch(error) {
      // If Constructed Stylesheets are not supported
      const style = document.createElement('style')
      style.innerHTML = cssCode
      this.#shadowRoot.append(style)
    }


  } // constructor()

  #initializeListenersAndAnimations() {

    this.#abortController = new AbortController()
    const signal = {signal: this.#abortController.signal}

    // Add focus to the 'rootContainer' to handle scroll with keyboard
    this.#rootContainer.addEventListener('mousedown', event => this.focus(), signal)

    // Handle Thumb size and position, and scrollbar visibility with '--overflow'
    this.#scrollBarAnimationID = requestAnimationFrame(this.#handleScrollbarAnimation.bind(this))

    // Handle scrollbar control with wheel
    this.#rootContainer.addEventListener('wheel', event => {
      if (event.ctrlKey) return

      // If the mouse is pressed and dragScroll is activated then disable wheel scroll
      if (mouse.isDown) {
        if (mouse.isTouch && this.#dragScrollMobile) return 
        else
        if (this.#dragScrollDesktop) return
      }

      // Prevent scrolling the parent when using the wheel on the container
      if (!event.shiftKey) {
        if ((this.#overflowY !== 'none' || (this.#overflow !== 'none' && this.#overflowY === '')) && this.#container.offsetHeight < this.#container.scrollHeight) {
          event.preventDefault()
        }
      }
      else {
        if ((this.#overflowX !== 'none' || (this.#overflow !== 'none' && this.#overflowX === '')) && this.#container.offsetWidth < this.#container.scrollWidth) {
          event.preventDefault()
        }
      }

      this.wheelScroll(event)
    }, signal);

    this.#verticalThumbContainer.addEventListener('touchstart', event => {
      // Prevent touch devices to scroll the parent when dragging the container
      if (!event.cancelable) return
      event.preventDefault()
    }, signal);

    this.#horizontalThumbContainer.addEventListener('touchstart', event => {
      // Prevent touch devices to scroll the parent when dragging the container
      if (!event.cancelable) return
      event.preventDefault()
    }, signal);

    // Get targets from the Shadow DOM
    ['mousedown', 'touchstart'].forEach(eventType => {
      this.#rootContainer.addEventListener(eventType, event => {
        mouse.pointerDown(event)
        this.#container.classList.remove('no-user-interaction')
      });
    }, signal);

    ['mouseup', 'touchend'].forEach(eventType => {
      this.#rootContainer.addEventListener(eventType, event => {
        mouse.pointerUp(event)
        this.#container.classList.remove('no-user-interaction')
      }, signal);
    });


    // Handle scrollbar control by dragging the thumb
    ['mousemove', 'touchmove'].forEach(eventType => {

      document.addEventListener(eventType, evt => {
        if (!mouse.isDown || mouse.mouseDownButton !== 0) return this.#container.classList.remove('no-user-interaction')

        const event = evt.touches ? evt.touches[0] : evt

        if (!this.#isThumbTarget()) return

        this.#container.classList.add('no-user-interaction')

        this.#handleThumbScroll(event)

        this.#scrollX = this.#container.scrollLeft
        this.#scrollY = this.#container.scrollTop
      }, signal)

    });


    // Handle scroll by dragging the content
    ['mousemove', 'touchmove'].forEach(eventType => {

      document.addEventListener(eventType, evt => {
        if (!mouse.isDown || mouse.mouseDownButton !== 0 || !mouse.path.includes(this.#container)) return

        const event = evt.touches ? evt.touches[0] : evt

        // Avoid scrolling while trying to select text
        // user must controll really well what it's supposed to be selectable
        if (getComputedStyle(mouse.target).userSelect !== 'none') return

        if ((evt.touches && this.#dragScrollMobile) || (!evt.touches && this.#dragScrollDesktop)) {
          this.#movementX = event.clientX - mouse.previousClientX
          this.#movementY = event.clientY - mouse.previousClientY

          if (this.#overflowX !== 'none') {
            this.#container.scrollBy(-this.#movementX, 0)
            this.#scrollX = this.#container.scrollLeft
          }

          if (this.#overflowY !== 'none') {
            this.#container.scrollBy(0, -this.#movementY)
            this.#scrollY = this.#container.scrollTop
          }
        }
      }, signal)

    });


    ['mouseup', 'touchend'].forEach(eventType => {
      document.addEventListener(eventType, evt => {  
        if (this.#scrollMovementX === 'smooth' && this.#overflowX !== 'none')
          this.#scrollX += -this.#movementX * (mouse.isTouch ? this.#dragScrollMobileSmoothX : this.#dragScrollDesktopSmoothX)

        if (this.#scrollMovementY === 'smooth' && this.#overflowY !== 'none')
          this.#scrollY += -this.#movementY * (mouse.isTouch ? this.#dragScrollMobileSmoothY : this.#dragScrollDesktopSmoothY)

        // Reset movement values after being used
        this.#movementX = this.#movementY = 0
      }, signal)
    });


    // Handle scrollbar control with scroll buttons
    this.#verticalIncrementButton.addEventListener('mousedown', event => {
      const speed = this.#verticalButtonSpeed
      this.#scrollY += speed
      this.#scrollY = this.clamp(0, this.#scrollY, this.#container.scrollHeight - this.#container.offsetHeight)

      if (this.#scrollMovementY === 'static') this.#container.scrollBy(0, speed)
    }, signal)

    this.#verticalDecrementButton.addEventListener('mousedown', event => {
      const speed = -this.#verticalButtonSpeed
      this.#scrollY += speed
      this.#scrollY = this.clamp(0, this.#scrollY, this.#container.scrollHeight - this.#container.offsetHeight)

      if (this.#scrollMovementY === 'static') this.#container.scrollBy(0, speed)
    }, signal)

    this.#horizontalIncrementButton.addEventListener('mousedown', event => {
      const speed = this.#horizontalButtonSpeed
      this.#scrollX += speed
      this.#scrollX = this.clamp(0, this.#scrollX, this.#container.scrollWidth - this.#container.offsetWidth)

      if (this.#scrollMovementX === 'static') this.#container.scrollBy(speed, 0)
    }, signal)

    this.#horizontalDecrementButton.addEventListener('mousedown', event => {
      const speed = -this.#horizontalButtonSpeed
      this.#scrollX += speed
      this.#scrollX = this.clamp(0, this.#scrollX, this.#container.scrollWidth - this.#container.offsetWidth)

      if (this.#scrollMovementX === 'static') this.#container.scrollBy(speed, 0)
    }, signal)

    // If an element is focused inside the container
    // the browser will scroll to make the element visible.
    // So in order to keep this accessibilty feature working
    // (at least focus fired by the user, since `focusin` doesn't fire when calling `focus` method of Elements)
    // when that happens we need to detect the scroll event
    // and re-assign the values of `#scrollY` and `#scrollX` 
    this.#container.addEventListener('focusin', event => {
      this.#container.addEventListener('scroll', event => {
        if (!event.isTrusted) return

        this.#scrollY = this.#container.scrollTop
        this.#scrollX = this.#container.scrollLeft
      }, {once: true})
    })

    // Handle scrollbar controls with keyboard
    // This will work only if the host element has focus which is done with a 'mousedown' listener
    window.addEventListener('keydown', event => {
      if (this.#overflowY === 'none') return
      if (!this.#keyboardScroll) return
      if (mouse.isDown || document.activeElement !== this) return

      switch (event.code) {
        case 'ArrowDown':
          this.#scrollY += this.#scrollSpeedY
        break

        case 'ArrowUp':
          this.#scrollY -= this.#scrollSpeedY
        break

        case 'ArrowRight':
          this.#scrollX += this.#scrollSpeedX
        break

        case 'ArrowLeft':
          this.#scrollX -= this.#scrollSpeedX
        break

        case 'PageDown':
          this.#scrollY += this.#container.offsetHeight
        break

        case 'PageUp':
          this.#scrollY -= this.#container.offsetHeight
        break
      }

      // Handle out of range
      this.#scrollX = this.clamp(0, this.#scrollX, this.#container.scrollWidth  - this.#container.offsetWidth)
      this.#scrollY = this.clamp(0, this.#scrollY, this.#container.scrollHeight - this.#container.offsetHeight)
    }, signal)

  } // #initializeListenersAndAnimations()


  #scrollBarAnimationID

  #handleScrollbarAnimation() {
    this.#scrollBarAnimationID = requestAnimationFrame(this.#handleScrollbarAnimation.bind(this))

    // Reset movement values to avoid smooth scrolling if the user has stopped scrolling
    if (!mouse.isTouch) this.#movementX = this.#movementY = 0

    if (mouse.isDown && this.#isThumbTarget()) return


    if (this.#scrollMovementX === 'smooth') {
      const speedX = this.cutDecimals((this.#scrollX - this.#container.scrollLeft) / this.#scrollSmoothX, 2)
      this.#container.scrollBy(speedX, 0)
    }
    // When changing resolution drastically (devtools simulated device) scrollLeft can change and this to go directly to '#scrollX' value
    else this.#container.scroll({left: this.#scrollX})

    if (this.#scrollMovementY === 'smooth') {
      const speedY = this.cutDecimals((this.#scrollY - this.#container.scrollTop) / this.#scrollSmoothY, 2)
      this.#container.scrollBy(0, speedY)
    }
    // When changing resolution drastically (devtools simulated device) scrollTop can change and this to go directly to '#scrollY' value
    else this.#container.scroll({top: this.#scrollY})

    // Vertical
    if (this.#overflowY === 'hidden' || this.#overflowY === 'none') {
      this.#rootContainer.classList.add('hide-vertical-scrollbar')
    } else if (this.#overflowY === 'scroll') {
      this.#rootContainer.classList.remove('hide-vertical-scrollbar')

      // Handle thumb size and position
      this.#handleVerticalThumbSize()
      this.#handleVerticalThumbPosition()
    } else

    // overflow: auto
    if (this.#container.offsetHeight === this.#container.scrollHeight) {
      this.#rootContainer.classList.add('hide-vertical-scrollbar')
    } else {
      this.#rootContainer.classList.remove('hide-vertical-scrollbar')
      this.#handleVerticalThumbSize()
      this.#handleVerticalThumbPosition()
    }

    // Horizontal
    if (this.#overflowX === 'hidden' || this.#overflowX === 'none') {
      this.#rootContainer.classList.add('hide-horizontal-scrollbar')
    } else if (this.#overflowX === 'scroll') {
      this.#rootContainer.classList.remove('hide-horizontal-scrollbar')

      // Handle thumb size and position
      this.#handleHorizontalThumbSize()
      this.#handleHorizontalThumbPosition()
    } else

    // overflow: auto
    if (this.#container.offsetWidth === this.#container.scrollWidth) {
      this.#rootContainer.classList.add('hide-horizontal-scrollbar')
    } else {
      this.#rootContainer.classList.remove('hide-horizontal-scrollbar')
      this.#handleHorizontalThumbSize()
      this.#handleHorizontalThumbPosition()
    }
  }


  wheelScroll(event) {
    if (mouse.isDown && this.#isThumbTarget()) return

    // Remove user insteraction while scrolling with the wheel
    if (!mouse.isTouch) this.#container.classList.add('no-user-interaction')

    const scrollSpeedX = this.#scrollSpeedX
    const scrollSpeedY = this.#scrollSpeedY

    const signX = this.getSign(event.deltaX)
    const signY = this.getSign(event.deltaY)

    if (event.deltaX === 0) {
      if ( event.shiftKey && this.#overflowX !== 'none') this.#scrollX += scrollSpeedX * signY
      if (!event.shiftKey && this.#overflowY !== 'none') this.#scrollY += scrollSpeedY * signY
    } else {
      // Devices that supports 'deltaX'
      if (!event.shiftKey && this.#overflowX !== 'none') this.#scrollX += scrollSpeedX * signX
      if ( event.shiftKey && this.#overflowY !== 'none') this.#scrollY += scrollSpeedY * signX
    }

    this.#scrollX = this.clamp(-scrollSpeedX, this.#scrollX, this.#container.scrollWidth  - this.#container.offsetWidth  + scrollSpeedX)
    this.#scrollY = this.clamp(-scrollSpeedY, this.#scrollY, this.#container.scrollHeight - this.#container.offsetHeight + scrollSpeedY)

    // Adjust 'scrollX' and 'scrollY' to avoid out of range values causing moements where the scroll won't move until it reaches a value in range
    if (this.#scrollY === -Math.abs(this.#scrollSpeedY)) {
      this.#scrollY = 0
    }
    else if (this.#scrollY >= Math.ceil(this.#maxContainerScrollTop())) {
      this.#scrollY = Math.ceil(this.#maxContainerScrollTop())
    }

    if (this.#scrollX === -Math.abs(this.#scrollSpeedX)) {
      this.#scrollX = 0
    }
    else if (this.#scrollX >= Math.ceil(this.#maxContainerScrollLeft())) {
      this.#scrollX = Math.ceil(this.#maxContainerScrollLeft())
    }
  }

  #handleThumbScroll(event) {
    const container                = this.#container
    const verticalThumbContainer   = this.#verticalThumbContainer
    const horizontalThumbContainer = this.#horizontalThumbContainer
    const verticalThumb            = this.#verticalThumb
    const horizontalThumb          = this.#horizontalThumb

    if (mouse.target === verticalThumb) {
      const verticalThumbContainerRect = verticalThumbContainer.getBoundingClientRect()

      const verticalThumbTop = event.clientY - mouse.elementMouseOffsetY - verticalThumbContainerRect.top

      // Handle Thumb Top Out Of Bounds
      if (verticalThumbTop <= 0) {
        verticalThumb.style.top = '0px'
        container.scroll({top: 0})
        return
      }

      // Handle Thumb Bottom Out Of Bounds
      const maxVerticalThumbTop = verticalThumbContainer.offsetHeight - verticalThumb.offsetHeight
      if (verticalThumbTop >= maxVerticalThumbTop) {
        verticalThumb.style.top = `${maxVerticalThumbTop}px`
        container.scroll({top: container.scrollHeight})
        return
      }

      // Vertical Thumb Position
      verticalThumb.style.top = `${verticalThumbTop}px`

      // Vertical Scroll Position
      const scrollY = container.scrollHeight * verticalThumb.offsetTop / verticalThumbContainerRect.height
      container.scroll({top: scrollY})
    }

    if (mouse.target === horizontalThumb) {
      const horizontalThumbContainerRect = horizontalThumbContainer.getBoundingClientRect()

      const horizontalThumbLeft = event.clientX - mouse.elementMouseOffsetX - horizontalThumbContainerRect.left

      // Handle Thumb Left Out Of Bounds
      if (horizontalThumbLeft <= 0) {
        horizontalThumb.style.left = '0px'
        container.scroll({left: 0})
        return
      }

      // Handle Thumb Right Out Of Bounds
      const maxHorizontalThumbLeft = horizontalThumbContainer.offsetWidth - horizontalThumb.offsetWidth
      if (horizontalThumbLeft >= maxHorizontalThumbLeft) {
        horizontalThumb.style.left = `${maxHorizontalThumbLeft}px`
        container.scroll({left: container.scrollWidth})
        return
      }

      // Horizontal Thumb Position
      horizontalThumb.style.left = `${horizontalThumbLeft}px`

      // Horizontal Scroll Position
      const scrollX = container.scrollWidth * horizontalThumb.offsetLeft / horizontalThumbContainerRect.width
      container.scroll({left: scrollX})
    }
  }

  #handleVerticalThumbSize() {
    const verticalThumbWidth         = this.#container.offsetHeight * 100 / this.#container.scrollHeight
    this.#verticalThumb.style.height = `${verticalThumbWidth   === 100 ? 0 : verticalThumbWidth}%`
  }

  #handleVerticalThumbPosition() {
    const verticalThumbPosition   = this.#container.scrollTop  * 100 / this.#container.scrollHeight
    this.#verticalThumb.style.top = `${verticalThumbPosition}%`
  }

  #handleHorizontalThumbSize() {
    const horizontalThumbHeight       = this.#container.offsetWidth  * 100 / this.#container.scrollWidth
    this.#horizontalThumb.style.width = `${horizontalThumbHeight === 100 ? 0 : horizontalThumbHeight}%`
  }

  #handleHorizontalThumbPosition() {
    const horizontalThumbPosition    = this.#container.scrollLeft * 100 / this.#container.scrollWidth
    this.#horizontalThumb.style.left = `${horizontalThumbPosition}%`
  }


  /** Custom Properties **/

  // Computed Styles
  #cs

  get #scrollSpeed() {
    const speed  = parseFloat(this.#cs.getPropertyValue('--scroll-speed'))
    return speed
  }
  get #scrollSpeedX() {
    const speedX = parseFloat(this.#cs.getPropertyValue('--scroll-speed-x'))
    return !isNaN(speedX) ? speedX : (isNaN(this.#scrollSpeed) ? 50 : this.#scrollSpeed)
  }
  get #scrollSpeedY() {
    const speedY = parseFloat(this.#cs.getPropertyValue('--scroll-speed-y'))
    return !isNaN(speedY) ? speedY : (isNaN(this.#scrollSpeed) ? 50 : this.#scrollSpeed)
  }

  get #overflowValues() {return ['scroll', 'auto', 'hidden', 'none']}
  get #overflow() {
    const overflow = this.#cs.getPropertyValue('--overflow').replace(/\s/g, '')
    if (!this.#overflowValues.includes(overflow)) return 'auto'
    return overflow
  }
  get #overflowX() {
    let overflowX = this.#cs.getPropertyValue('--overflow-x').replace(/\s/g, '')
    if (!this.#overflowValues.includes(overflowX)) overflowX = this.#overflow
    return overflowX
  }
  get #overflowY() {
    let overflowY = this.#cs.getPropertyValue('--overflow-y').replace(/\s/g, '')
    if (!this.#overflowValues.includes(overflowY)) overflowY = this.#overflow
    return overflowY
  }

  get #scrollMovementValues() {return ['smooth', 'static']}
  get #scrollMovement() {
    const scrollMovement = this.#cs.getPropertyValue('--scroll-movement').replace(/\s/g, '')
    if (!this.#scrollMovementValues.includes(scrollMovement)) return 'smooth'
    return scrollMovement
  }
  get #scrollMovementX() {
    let scrollMovementX = this.#cs.getPropertyValue('--scroll-movement-x').replace(/\s/g, '')
    if(!this.#scrollMovementValues.includes(scrollMovementX)) scrollMovementX = this.#scrollMovement
    return scrollMovementX
  }
  get #scrollMovementY() {
    let scrollMovementY = this.#cs.getPropertyValue('--scroll-movement-y').replace(/\s/g, '')
    if(!this.#scrollMovementValues.includes(scrollMovementY)) scrollMovementY = this.#scrollMovement
    return scrollMovementY
  }

  get #scrollSmooth() {
    let scrollSmooth = parseFloat(this.#cs.getPropertyValue('--scroll-smooth'))
    scrollSmooth = isNaN(scrollSmooth) ? 10 : scrollSmooth
    return Math.max(1, Math.abs(scrollSmooth))
  }

  get #scrollSmoothX() {
    let scrollSmoothX = parseFloat(this.#cs.getPropertyValue('--scroll-smooth-x'))
    scrollSmoothX = isNaN(scrollSmoothX) ? this.#scrollSmooth : scrollSmoothX
    return Math.max(1, Math.abs(scrollSmoothX))
  }

  get #scrollSmoothY() {
    let scrollSmoothY = parseFloat(this.#cs.getPropertyValue('--scroll-smooth-y'))
    scrollSmoothY = isNaN(scrollSmoothY) ? this.#scrollSmooth : scrollSmoothY
    return Math.max(1, Math.abs(scrollSmoothY))
  }

  get #dragScrollDesktopSmooth() {
    let dragScrollDesktopSmooth = parseFloat(this.#cs.getPropertyValue('--drag-scroll-desktop-smooth'))
    dragScrollDesktopSmooth = !isNaN(dragScrollDesktopSmooth) ? dragScrollDesktopSmooth : 0 
    return dragScrollDesktopSmooth
  }

  get #dragScrollDesktopSmoothX() {
    let dragScrollDesktopSmoothX = parseFloat(this.#cs.getPropertyValue('--drag-scroll-desktop-smooth-x'))
    dragScrollDesktopSmoothX = !isNaN(dragScrollDesktopSmoothX) ? dragScrollDesktopSmoothX : this.#dragScrollDesktopSmooth
    return dragScrollDesktopSmoothX
  }

  get #dragScrollDesktopSmoothY() {
    let dragScrollDesktopSmoothY = parseFloat(this.#cs.getPropertyValue('--drag-scroll-desktop-smooth-y'))
    dragScrollDesktopSmoothY = !isNaN(dragScrollDesktopSmoothY) ? dragScrollDesktopSmoothY : this.#dragScrollDesktopSmooth
    return dragScrollDesktopSmoothY
  }

  get #dragScrollMobileSmooth() {
    let dragScrollMobileSmooth = parseFloat(this.#cs.getPropertyValue('--drag-scroll-mobile-smooth'))
    dragScrollMobileSmooth = !isNaN(dragScrollMobileSmooth) ? dragScrollMobileSmooth : 15
    return dragScrollMobileSmooth
  }

  get #dragScrollMobileSmoothX() {
    let dragScrollMobileSmoothX = parseFloat(this.#cs.getPropertyValue('--drag-scroll-mobile-smooth-x'))
    dragScrollMobileSmoothX = !isNaN(dragScrollMobileSmoothX) ? dragScrollMobileSmoothX : this.#dragScrollMobileSmooth
    return dragScrollMobileSmoothX
  }

  get #dragScrollMobileSmoothY() {
    let dragScrollMobileSmoothY = parseFloat(this.#cs.getPropertyValue('--drag-scroll-mobile-smooth-y'))
    dragScrollMobileSmoothY = !isNaN(dragScrollMobileSmoothY) ? dragScrollMobileSmoothY : this.#dragScrollMobileSmooth
    return dragScrollMobileSmoothY
  }

  get #verticalButtonSpeed() {
    let verticalButtonSpeed = parseFloat(this.#cs.getPropertyValue('--vertical-button-speed'))
    verticalButtonSpeed = !isNaN(verticalButtonSpeed) ? verticalButtonSpeed : 50
    return verticalButtonSpeed
  }

  get #horizontalButtonSpeed() {
    let horizontalButtonSpeed = parseFloat(this.#cs.getPropertyValue('--horizontal-button-speed'))
    horizontalButtonSpeed = !isNaN(horizontalButtonSpeed) ? horizontalButtonSpeed : 50
    return horizontalButtonSpeed
  }

  get #dragScrollDesktop() {
    let dragScrollDesktop =  this.#cs.getPropertyValue('--drag-scroll-desktop').replace(/\s/g, '')
    dragScrollDesktop = dragScrollDesktop !== 'true' ? false : true
    return dragScrollDesktop
  }

  get #dragScrollMobile() {
    let dragScrollMobile =  this.#cs.getPropertyValue('--drag-scroll-mobile').replace(/\s/g, '')
    dragScrollMobile = dragScrollMobile !== 'false' ? true : false
    return dragScrollMobile
  }

  get #keyboardScroll() {
    let keyboardScroll = this.#cs.getPropertyValue('--keyboard-scroll').replace(/\s/g, '')
    keyboardScroll = keyboardScroll !== 'false' ? true : false
    return keyboardScroll
  }


  #maxContainerScrollTop() {
    return this.#container.scrollHeight - this.#container.offsetHeight
  }

  #maxContainerScrollLeft() {
    return this.#container.scrollWidth - this.#container.offsetWidth
  }


  #isThumbTarget() {
    return mouse.target === this.#verticalThumb || mouse.target === this.#horizontalThumb
  }


  #shadowRoot
  #rootContainer
  #container

  #verticalScrollbar
  #verticalDecrementButton
  #verticalThumbContainer
  #verticalThumb
  #verticalIncrementButton

  #horizontalScrollbar
  #horizontalDecrementButton
  #horizontalThumbContainer
  #horizontalThumb
  #horizontalIncrementButton

  #cornerScrollbar

  // Reference values for the 'smooth' scroll movement to transition to
  // This reference is also useful when changing to diferent window sizes that modifies the scroll values (example: when using devtools simulated devices)
  #scrollY
  #scrollX

  // Reference of the last values to use in the 'touchend' event for the smooth drag scrolling
  #movementX
  #movementY

} // class ScrollBox
