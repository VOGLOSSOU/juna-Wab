import toast from 'react-hot-toast'

type ApiErr = { response?: { status?: number; data?: { message?: string | string[]; code?: string; error?: { code?: string } } } }

export function getApiErrorCode(err: unknown): string | undefined {
  return (err as ApiErr)?.response?.data?.error?.code ?? (err as ApiErr)?.response?.data?.code
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


export function getApiErrorMessage(error: unknown, fallback = 'Une erreur est survenue. Réessayez.') {
  const message = (error as ApiErr)?.response?.data?.message
  return Array.isArray(message) ? message.join(' ') : typeof message === 'string' && message.trim() ? message : fallback
}
export function getLoginErrorMessage(error: unknown) {
  if ((error as ApiErr)?.response?.status === 401 || getApiErrorCode(error) === 'INVALID_CREDENTIALS') {
    return 'Email ou mot de passe incorrect.'
  }
  return getApiErrorMessage(error, 'Connexion impossible pour le moment. Vérifiez votre connexion et réessayez.')
}
