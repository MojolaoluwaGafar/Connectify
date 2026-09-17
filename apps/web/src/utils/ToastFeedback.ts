import { toast } from "react-toastify"

export const themedToast = {
  success: (msg: string) =>
    toast.success(msg, { className: 'toast-success'}),
  error: (msg: string) =>
    toast.error(msg, { className: 'toast-error' }),
  info: (msg: string) =>
    toast.info(msg, { className: 'toast-info' }),
  warning: (msg: string) =>
    toast.warn(msg, { className: 'toast-warning' }),
};
