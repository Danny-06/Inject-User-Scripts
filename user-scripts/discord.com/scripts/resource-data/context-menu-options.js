import { createElement, generateFloatingIframe, showPromptDialog } from '../../../@libs/utils-injection.js'
import * as discordUtils from '../discord-utils.js'

export const copyCodeBlockToClipboard = {
  id: 'copy-codeblock-to-clipboard',
  name: 'Copy codeblock to clipboard',
  icon: // html
  `
  <svg height="100%" viewBox="0 0 36 36" width="100%">
      <path fill="#fff" d="M14.1 24.9L7.2 18.0l6.9-6.9L12.0 9.0l-9.0 9.0 9.0 9.0 2.1-2.1zm7.8 .0l6.9-6.9-6.9-6.9L24.0 9.0l9.0 9.0-9.0 9.0-2.1-2.1z" />
  </svg>
  `
  ,

  condition(event) {
    const codeBlock = event.target.closest('[id^="chat-messages"] pre > code')

    return codeBlock !== null
  },
  action: async (item, event) => {
    const codeBlock = event.target.closest('[id^="chat-messages"] pre > code')

    if (!codeBlock) return

    navigator.clipboard.writeText(codeBlock.textContent)
  }
}

export const getProfileImg = {
  id: 'get-profile-image',
  name: 'Open Profile Image in a new tab',
  icon: // html
  `
  <svg viewBox="0 0 1000 1000">
      <g>
          <path fill="currentColor" d="M749.8,993.3H250.2C117.8,993.3,10,884.8,10,751.4V248.6C10,115.2,117.8,6.7,250.2,6.7h499.6C882.2,6.7,990,115.2,990,248.6v502.9C990,884.8,882.2,993.3,749.8,993.3z M250.2,69.8c-97.9,0-177.6,80.2-177.6,178.7v502.9c0,98.6,79.6,178.7,177.6,178.7h499.6c97.9,0,177.6-80.2,177.6-178.7V248.6c0-98.5-79.7-178.7-177.6-178.7H250.2z"></path>
          <path fill="currentColor" d="M958.6,723.9c-7.1,0-14.2-2.4-20-7.3l-207.3-174l-170.9,172c-11.7,11.8-32.6,11.8-44.3,0l-245.4-247L63.5,676.2c-12.2,12.3-32.1,12.3-44.3,0c-12.2-12.3-12.2-32.3,0-44.6l229.3-230.9c12.2-12.3,32.1-12.3,44.3,0l245.4,247l169-170.1c11.4-11.6,29.8-12.4,42.2-1.9l229.3,192.4c13.3,11.1,15.1,31,4,44.4C976.5,720.1,967.6,723.9,958.6,723.9z"></path>
          <path fill="currentColor" d="M633.8,416.1c-70,0-126.9-57.3-126.9-127.7c0-70.4,56.9-127.7,126.9-127.7c70,0,126.9,57.3,126.9,127.7C760.7,358.8,703.7,416.1,633.8,416.1z M633.8,223.7c-35.4,0-64.2,29-64.2,64.6c0,35.6,28.8,64.6,64.2,64.6c35.4,0,64.2-29,64.2-64.6C698,252.7,669.2,223.7,633.8,223.7z"></path>
      </g>
  </svg>
  `
  ,

  condition(event) {
    const profileImage = event.target.closest('img.avatar-2e8lTP.clickable-31pE3P')

    return profileImage !== null
  },
  action: async (item, event) => {
    const profileImage = event.target.closest('img.avatar-2e8lTP.clickable-31pE3P')

    if (!profileImage) return

    const profileImageURL = new URL(profileImage.src)

    profileImageURL.searchParams.set('size', '4096')

    const gifURL = new URL(profileImageURL.href.replace('.webp', '.gif'))

    const gifURLNoSize = new URL(gifURL.href)
    gifURLNoSize.searchParams.delete('size')

    fetch(gifURL.href)
    .then(r => {
      if (r.status === 200) window.open(gifURL.href)
      else                  window.open(profileImageURL.href)
    })
  }
}

export const changeChatBackground = {
  id: 'change-chat-bg',
  name: 'Change Chat Background',
  icon: // html
  `
  <svg viewBox="0 0 1000 1000">
      <g>
          <path fill="currentColor" d="M749.8,993.3H250.2C117.8,993.3,10,884.8,10,751.4V248.6C10,115.2,117.8,6.7,250.2,6.7h499.6C882.2,6.7,990,115.2,990,248.6v502.9C990,884.8,882.2,993.3,749.8,993.3z M250.2,69.8c-97.9,0-177.6,80.2-177.6,178.7v502.9c0,98.6,79.6,178.7,177.6,178.7h499.6c97.9,0,177.6-80.2,177.6-178.7V248.6c0-98.5-79.7-178.7-177.6-178.7H250.2z"></path>
          <path fill="currentColor" d="M958.6,723.9c-7.1,0-14.2-2.4-20-7.3l-207.3-174l-170.9,172c-11.7,11.8-32.6,11.8-44.3,0l-245.4-247L63.5,676.2c-12.2,12.3-32.1,12.3-44.3,0c-12.2-12.3-12.2-32.3,0-44.6l229.3-230.9c12.2-12.3,32.1-12.3,44.3,0l245.4,247l169-170.1c11.4-11.6,29.8-12.4,42.2-1.9l229.3,192.4c13.3,11.1,15.1,31,4,44.4C976.5,720.1,967.6,723.9,958.6,723.9z"></path>
          <path fill="currentColor" d="M633.8,416.1c-70,0-126.9-57.3-126.9-127.7c0-70.4,56.9-127.7,126.9-127.7c70,0,126.9,57.3,126.9,127.7C760.7,358.8,703.7,416.1,633.8,416.1z M633.8,223.7c-35.4,0-64.2,29-64.2,64.6c0,35.6,28.8,64.6,64.2,64.6c35.4,0,64.2-29,64.2-64.6C698,252.7,669.2,223.7,633.8,223.7z"></path>
      </g>
  </svg>
  `
  ,
  action: item => {
    discordUtils.changeChatBackground()
  }
}

export const changeChatBgOverlayColor = {
  id: 'change-chat-bg-overlay-color',
  name: 'Change Chat BG Overlay Color',
  icon: // html
  `
  <svg viewBox="0 0 1000 1000">
      <g>
          <path fill="currentColor" d="M749.8,993.3H250.2C117.8,993.3,10,884.8,10,751.4V248.6C10,115.2,117.8,6.7,250.2,6.7h499.6C882.2,6.7,990,115.2,990,248.6v502.9C990,884.8,882.2,993.3,749.8,993.3z M250.2,69.8c-97.9,0-177.6,80.2-177.6,178.7v502.9c0,98.6,79.6,178.7,177.6,178.7h499.6c97.9,0,177.6-80.2,177.6-178.7V248.6c0-98.5-79.7-178.7-177.6-178.7H250.2z"></path>
          <path fill="currentColor" d="M958.6,723.9c-7.1,0-14.2-2.4-20-7.3l-207.3-174l-170.9,172c-11.7,11.8-32.6,11.8-44.3,0l-245.4-247L63.5,676.2c-12.2,12.3-32.1,12.3-44.3,0c-12.2-12.3-12.2-32.3,0-44.6l229.3-230.9c12.2-12.3,32.1-12.3,44.3,0l245.4,247l169-170.1c11.4-11.6,29.8-12.4,42.2-1.9l229.3,192.4c13.3,11.1,15.1,31,4,44.4C976.5,720.1,967.6,723.9,958.6,723.9z"></path>
          <path fill="currentColor" d="M633.8,416.1c-70,0-126.9-57.3-126.9-127.7c0-70.4,56.9-127.7,126.9-127.7c70,0,126.9,57.3,126.9,127.7C760.7,358.8,703.7,416.1,633.8,416.1z M633.8,223.7c-35.4,0-64.2,29-64.2,64.6c0,35.6,28.8,64.6,64.2,64.6c35.4,0,64.2-29,64.2-64.6C698,252.7,669.2,223.7,633.8,223.7z"></path>
      </g>
  </svg>
  `
  ,
  action: async item => {
    const color = await showPromptDialog(`Write the color you want for the overlay of the background chat`, '#000c')
    if (color == null) return

    discordUtils.changeChatBgOverlayColor(color)
  }
}

export const getServerIcon = {
  id: 'get-server-icon',
  name: 'Open server icon in a new tab',
  icon: // html
  `
  `
  ,

  condition(event) {
    const imgServerIcon = document.querySelector(`[data-list-id="guildsnav"] .listItem-3SmSlK .blobContainer-ikKyFs.selected-3c78Ai img`)
    return imgServerIcon !== null
  },
  action: async item => {
    const serverIconURL = await discordUtils.getServerIcon().catch(() => null)
    if (!serverIconURL) return

    window.open(serverIconURL)
  }
}

export const getServerBanner = {
  id: 'get-server-banner',
  name: 'Open server banner in a new tab',
  icon: // html
  `
  `
  ,
  condition(event) {
    const imgServerBanner = document.querySelector(`.sidebar-1tnWFu .bannerImage-ubW8K- img`)

    return imgServerBanner !== null
  },
  action: async item => {
    const serverBannerURL = await discordUtils.getServerBanner().catch(() => null)
    if (!serverBannerURL) return

    window.open(serverBannerURL)
  }
}

// Get nonce value of scritps to execute myOwn internal scritps
const nonceScript = document.querySelector('script[nonce]')?.nonce

export const runCodeBlocks = {
  id: 'run-codeblocks',
  name: 'Run codeblocks',
  icon: // html
  `
  <svg height="100%" viewBox="0 0 36 36" width="100%">
      <path fill="#fff" d="M14.1 24.9L7.2 18.0l6.9-6.9L12.0 9.0l-9.0 9.0 9.0 9.0 2.1-2.1zm7.8 .0l6.9-6.9-6.9-6.9L24.0 9.0l9.0 9.0-9.0 9.0-2.1-2.1z" />
  </svg>
  `
  ,

  condition(event) {
    const message = event.target.closest('.messageListItem-ZZ7v6g')

    const codeBlock = message.querySelector('pre > code')

    return codeBlock !== null
  },
  action: async (item, event) => {
    const message = event.target.closest('.messageListItem-ZZ7v6g')

    const codeBlocks = [...message.querySelectorAll('pre > code')]

    const cbHtml = codeBlocks.filter(c => c.classList.contains('html'))[0]
    const cbCss  = codeBlocks.filter(c => c.classList.contains('css'))[0]
    const cbJs   = codeBlocks.filter(c => c.classList.contains('js') || c.classList.contains('mjs'))[0]

    const iframe = generateFloatingIframe(false)

    iframe.contentDocument.write(
      cbHtml?.textContent ??
      `There's nothing here. You may want to check the console.
      <br><br>
      Tip: Check the "Selected Context Only" option to see only the logs of the iframe.`
    )
    iframe.contentDocument.close()

    const style = createElement('style', {properties: {
      innerHTML: cbCss?.textContent ?? 'body {background-color: #111; color: #fff;}'
    }})

    const script = createElement('script', {properties:{
      innerHTML: cbJs?.textContent ?? '',
      type: cbJs?.classList.contains('mjs') ? 'module' : undefined,
      defer: cbJs?.classList.contains('js') ? true : undefined,
      nonce: nonceScript
    }})

    iframe.contentDocument.head.append(style, script)
  }
}
