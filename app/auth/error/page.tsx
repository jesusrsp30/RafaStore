import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-background">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl border border-border p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">Error de autenticación</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Ocurrió un problema durante el proceso de autenticación. 
            Por favor, intenta nuevamente.
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
