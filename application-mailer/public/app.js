const form = document.getElementById('application');
const status = document.getElementById('status');
const button = document.getElementById('submit');
const job = new URLSearchParams(location.search).get('job');
if (job) document.getElementById('job').value = job.slice(0, 150);

async function initializeSecurity() {
  try {
    const response = await fetch('/api/config', { cache: 'no-store' });
    if (!response.ok) throw new Error('Configuration unavailable');
    const { siteKey } = await response.json();
    if (!window.turnstile || !siteKey) throw new Error('Security check unavailable');
    window.turnstile.render('#turnstile', { sitekey: siteKey });
  } catch {
    status.textContent = 'Security check failed to load. Please refresh the page.';
    status.className = 'error';
    button.disabled = true;
  }
}
window.addEventListener('load', initializeSecurity);
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.textContent = '';
  status.className = '';
  const cv = form.elements.cv.files[0];
  const photo = form.elements.photo.files[0];
  if ([cv, photo].some((file) => !file || file.size > 6 * 1024 * 1024)) {
    status.textContent = 'Please attach both files, each no larger than 6 MB.';
    status.className = 'error';
    return;
  }
  button.disabled = true;
  button.textContent = 'Sending...';
  try {
    const response = await fetch('/api/apply', { method: 'POST', body: new FormData(form) });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || 'Unable to send application.');
    status.textContent = 'Application sent successfully. Thank you.';
    status.className = 'success';
    form.reset();
    if (job) document.getElementById('job').value = job.slice(0, 150);
  } catch (error) {
    status.textContent = error.message || 'Unable to send application. Please try again.';
    status.className = 'error';
  } finally {
    window.turnstile?.reset?.();
    button.disabled = false;
    button.textContent = 'Send application';
  }
});
