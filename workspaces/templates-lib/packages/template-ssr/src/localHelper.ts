export function getLocalHelperJs(): string {
  return `
let versionTimestamp = null;
let initialLoad = true;

const messageContainer = document.createElement('div');
messageContainer.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:10000;transition:opacity 0.5s;opacity:0;pointer-events:none;display:none;';
document.body.appendChild(messageContainer);

function showMessage(icon, message, duration = null) {
  messageContainer.innerHTML = \`
    <div style="display:flex;align-items:center;gap:10px;padding:10px 20px;border-radius:8px;background-color:white;box-shadow:0px 4px 10px rgba(0,0,0,0.2);font-family:Arial,sans-serif;font-size:14px;color:#333;">
      <span style="width:20px;height:20px;">\${icon}</span>
      <span>\${message}</span>
    </div>
  \`;
  messageContainer.style.display = 'block';
  messageContainer.style.opacity = '1';
  if (duration) {
    setTimeout(() => {
      messageContainer.style.opacity = '0';
      setTimeout(() => messageContainer.style.display = 'none', 500);
    }, duration);
  }
}

function fetchWithTimeout(url, options = {}, timeout = 200) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout))
  ]);
}
async function checkVersionTimestamp() {
  try {
    const response = await fetchWithTimeout('_goldstack/local/versionTimestamp', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch');
    const newTimestamp = await response.text();
    if (versionTimestamp === null) {
      showMessage('✅', 'Connected to server', 3000);
    } else if (newTimestamp !== versionTimestamp) {
      location.reload();
    }

    versionTimestamp = newTimestamp;
  } catch (error) {
      showMessage('❌', 'Connection to server lost. Waiting for restart ...');
      versionTimestamp = null;
  }
}

function startReloadChecker() {
  setInterval(checkVersionTimestamp, 1000);
}


function checkInitialConnection() {
  if (initialLoad) {
    let connectionAttempts = 0;
    const maxAttempts = 3;
    const attemptInterval = 1000;

    const attemptConnection = async () => {
      await checkVersionTimestamp();
      if (versionTimestamp !== null) {
        initialLoad = false;
        startReloadChecker();
      } else if (connectionAttempts < maxAttempts) {
        connectionAttempts++;
        setTimeout(attemptConnection, attemptInterval);
      } else {
        showMessage('🔄', 'Connecting to server');
        const interval = setInterval(async () => {
          await checkVersionTimestamp();
          if (versionTimestamp !== null) {
            clearInterval(interval);
            initialLoad = false;
            startReloadChecker();
          }
        }, 10000);
      }
    };

    attemptConnection();
  }
}


checkInitialConnection();
`;
}
