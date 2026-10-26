import Swal from 'sweetalert2';

// Brand colors of the app (Tailwind orange-600 / slate-900)
const BRAND = '#EA580C';
const INK = '#0F172A';

const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  color: INK,
});

/** Confirms that an action finished; closes by itself. */
export const notifySuccess = (title: string, text?: string) =>
  toast.fire({ icon: 'success', title, text });

/** Explains why an action could not be completed; the user closes it. */
export const notifyError = (title: string, text?: string) =>
  Swal.fire({
    icon: 'error',
    title,
    text,
    color: INK,
    confirmButtonText: 'Entendido',
    confirmButtonColor: BRAND,
  });

/** Lists what is missing in a form before it can be saved. */
export const notifyFormErrors = (messages: string[]) => {
  const list = document.createElement('ul');
  // Tailwind's base styles remove list bullets; put them back for this list
  list.style.cssText =
    'text-align:left;margin:0;padding-left:1.2em;list-style:disc;';
  for (const message of messages) {
    const item = document.createElement('li');
    item.textContent = message;
    list.appendChild(item);
  }
  return Swal.fire({
    icon: 'warning',
    title: 'Revisa el formulario',
    html: list,
    color: INK,
    confirmButtonText: 'Entendido',
    confirmButtonColor: BRAND,
  });
};
