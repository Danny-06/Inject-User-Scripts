const tab = await getCurrentTab()

const domain = tab.url ? new URL(tab.url).hostname : `Can't access this page`

const h1DomainName = document.querySelector('#domain-name')
h1DomainName.innerHTML = domain



async function getCurrentTab() {
  const queryOptions = {active: true, currentWindow: true};
  const [tab] = await chrome.tabs.query(queryOptions);

  return tab;
}
