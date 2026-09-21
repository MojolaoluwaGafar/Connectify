import { createElement } from "react"
import { toast } from "react-toastify"
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react"

const icons = {
  success: CircleCheck,
  error: CircleX,
  info: Info,
  warning: TriangleAlert,
}

function toastIcon(type: keyof typeof icons) {
  return () => createElement(icons[type], { size: 20, strokeWidth: 2.25 })
}

export const themedToast = {
  success: (msg: string) =>
    toast.success(msg, { className: 'toast-success', icon: toastIcon('success') }),
  error: (msg: string) =>
    toast.error(msg, { className: 'toast-error', icon: toastIcon('error') }),
  info: (msg: string) =>
    toast.info(msg, { className: 'toast-info', icon: toastIcon('info') }),
  warning: (msg: string) =>
    toast.warn(msg, { className: 'toast-warning', icon: toastIcon('warning') }),
};
