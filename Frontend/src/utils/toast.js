// Simple Toast Notification System
const createToastElement = (message, type, duration = 3000) => {
  const toastId = `toast-${Date.now()}`;
  
  // Create container if not exists
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = `
    flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur
    border pointer-events-auto animate-in slide-in-from-right-full duration-300
    min-w-[300px] max-w-[400px]
    ${type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''}
    ${type === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
    ${type === 'info' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
    ${type === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : ''}
  `;

  // Icon mapping
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  toast.innerHTML = `
    <span class="text-lg shrink-0">${icons[type] || '📢'}</span>
    <span class="flex-1 font-medium text-sm">${message}</span>
    <button class="text-lg opacity-60 hover:opacity-100 shrink-0">×</button>
  `;

  // Close button functionality
  const closeBtn = toast.querySelector('button');
  closeBtn.addEventListener('click', () => {
    toast.classList.add('animate-out', 'slide-out-to-right-full', 'duration-300');
    setTimeout(() => toast.remove(), 300);
  });

  container.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    if (document.getElementById(toastId)) {
      toast.classList.add('animate-out', 'slide-out-to-right-full', 'duration-300');
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
};

export const toast = {
  success: (message, duration = 3000) => createToastElement(message, 'success', duration),
  error: (message, duration = 4000) => createToastElement(message, 'error', duration),
  info: (message, duration = 3000) => createToastElement(message, 'info', duration),
  warning: (message, duration = 3500) => createToastElement(message, 'warning', duration),
};

export default toast;
