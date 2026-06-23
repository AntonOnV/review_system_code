import { Button, DropdownMenu } from '@radix-ui/themes';
import { CheckIcon, GlobeIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', labelKey: 'language.english' },
  { code: 'uk', labelKey: 'language.ukrainian' },
];

function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const selectLanguage = (language) => {
    localStorage.setItem('language', language);
    i18n.changeLanguage(language);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="soft" color="gray" aria-label={t('language.label')}>
          <GlobeIcon /> {i18n.language === 'uk' ? 'UA' : 'EN'}
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {languages.map(({ code, labelKey }) => (
          <DropdownMenu.Item key={code} onSelect={() => selectLanguage(code)}>
            {i18n.language === code && <CheckIcon />}
            {t(labelKey)}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export default LanguageSelector;
