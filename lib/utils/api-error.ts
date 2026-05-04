import toast from 'react-hot-toast'

type ApiErr = { response?: { data?: { message?: string | string[]; error?: { code?: string } } } }

export function getApiErrorCode(err: unknown): string | undefined {
  return (err as ApiErr)?.response?.data?.error?.code
}

export function showApiError(err: unknown, fallback = 'Une erreur est survenue. Réessayez.') {
  const message = (err as ApiErr)?.response?.data?.message
  if (!message) {
    toast.error(fallback)
    return
  }
  if (Array.isArray(message)) {
    message.forEach(m => toast.error(m))
  } else {
    toast.error(message)
  }
}
