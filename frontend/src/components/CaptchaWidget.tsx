import { Turnstile } from '@marsidev/react-turnstile'

interface CaptchaWidgetProps {
  onSuccess: (token: string) => void
  onExpire: () => void
  onError: () => void
}

export function CaptchaWidget({ onSuccess, onExpire, onError }: CaptchaWidgetProps) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'

  return (
    <div className="flex justify-center">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onSuccess}
        onExpire={onExpire}
        onError={onError}
        options={{
          theme: 'light',
          language: 'es',
        }}
      />
    </div>
  )
}
