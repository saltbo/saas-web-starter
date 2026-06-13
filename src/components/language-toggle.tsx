import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { languages } from '@/i18n'

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const next = () => {
    const index = languages.findIndex((language) => language.value === i18n.language)
    void i18n.changeLanguage(languages[(index + 1) % languages.length].value)
  }
  return (
    <Button variant="ghost" size="icon-sm" aria-label="Switch language" onClick={next}>
      <Languages />
    </Button>
  )
}
