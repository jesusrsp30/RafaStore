import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-background">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl border border-border p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">Revisa tu correo</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Te hemos enviado un enlace de confirmación a tu correo electrónico. 
            Por favor, haz clic en el enlace para activar tu cuenta.
          </p>
          <Link
            href="/auth/login"
            className="inline-block w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all text-center"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
