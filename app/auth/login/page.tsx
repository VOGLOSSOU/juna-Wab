'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login, getUserProfile } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/auth'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
})

type FormData = z.infer<typeof schema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { setAuth, updateUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const result = await login(data)
      setAuth(result.user, result.accessToken, result.refreshToken)
      getUserProfile().then(updateUser).catch(() => {})
      toast.success('Connexion réussie !')
      router.push(redirect)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { code?: string } } } }
      const code = error?.response?.data?.error?.code
      if (code === 'INVALID_CREDENTIALS') {
        toast.error('Email ou mot de passe incorrect')
      } else {
        toast.error('Une erreur est survenue. Réessayez.')
      }
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <Image src="/logo_green_orange.png" alt="JUNA" width={80} height={32} className="object-contain" />
          <h1 className="text-headline-large font-semibold text-text-primary">Se connecter</h1>
          <p className="text-text-secondary text-sm">Bon retour sur JUNA !</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="vous@exemple.com"
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <Input
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.password?.message}
            required
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-light hover:text-text-secondary">
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            }
            {...register('password')}
          />

          <div className="flex justify-end">
            <Link href="#" className="text-sm text-primary hover:underline">Mot de passe oublié ?</Link>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
            Se connecter
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-primary font-medium hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
