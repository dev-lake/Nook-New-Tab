import { useRef } from 'react';
import { ChevronDown, Download, ExternalLink, Image, PanelBottomClose, Search, Settings, Trash2, Upload, X } from 'lucide-react';
import { BUILT_IN_BACKGROUNDS } from '../backgrounds';
import type { Translation } from '../i18n';
import type { BackgroundPreference, SearchEngineId } from '../types';

type SettingsPopoverProps = {
  open: boolean;
  t: Translation;
  searchEngine: SearchEngineId;
  background: BackgroundPreference;
  customBackgroundUrl: string | null;
  onClose: () => void;
  onSearchEngineChange: (value: SearchEngineId) => void;
  onBackgroundChange: (value: BackgroundPreference) => void;
  onCustomBackgroundUpload: (file: File) => void;
  onRemoveCustomBackground: () => void;
  onImportBookmarks: () => void;
};

function backgroundLabel(value: BackgroundPreference, t: Translation): string {
  if (value === 'mist') return t.mistBackground;
  if (value === 'dunes') return t.dunesBackground;
  if (value === 'midnight') return t.midnightBackground;
  if (value === 'custom') return t.customBackground;
  return t.noBackground;
}

export function SettingsPopover({
  open,
  t,
  searchEngine,
  background,
  customBackgroundUrl,
  onClose,
  onSearchEngineChange,
  onBackgroundChange,
  onCustomBackgroundUpload,
  onRemoveCustomBackground,
  onImportBookmarks,
}: SettingsPopoverProps) {
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  if (!open) return null;

  return (
    <section className="settings-popover" aria-label={t.settings}>
      <header>
        <span><Settings size={17} />{t.settings}</span>
        <button type="button" className="icon-button" onClick={onClose} aria-label={t.cancel}>
          <X size={17} />
        </button>
      </header>

      <label>
        <span><Search size={15} />{t.searchEngine}</span>
        <select value={searchEngine} onChange={(event) => onSearchEngineChange(event.target.value as SearchEngineId)}>
          <option value="google">Google</option>
          <option value="bing">Bing</option>
          <option value="duckduckgo">DuckDuckGo</option>
        </select>
      </label>

      <fieldset className="background-settings">
        <legend><Image size={15} />{t.background}</legend>
        <div className="background-options">
          <button
            type="button"
            className="background-option background-none"
            aria-label={t.noBackground}
            aria-pressed={background === 'none'}
            onClick={() => onBackgroundChange('none')}
          >
            <span aria-hidden="true" />
            <small>{t.noBackground}</small>
          </button>
          {BUILT_IN_BACKGROUNDS.map((item) => (
            <button
              type="button"
              className="background-option"
              key={item.id}
              aria-label={backgroundLabel(item.id, t)}
              aria-pressed={background === item.id}
              onClick={() => onBackgroundChange(item.id)}
            >
              <span style={{ backgroundImage: `url(${item.path})` }} aria-hidden="true" />
              <small>{backgroundLabel(item.id, t)}</small>
            </button>
          ))}
          {customBackgroundUrl && (
            <button
              type="button"
              className="background-option"
              aria-label={t.customBackground}
              aria-pressed={background === 'custom'}
              onClick={() => onBackgroundChange('custom')}
            >
              <span style={{ backgroundImage: `url(${customBackgroundUrl})` }} aria-hidden="true" />
              <small>{t.customBackground}</small>
            </button>
          )}
        </div>
        <div className="background-actions">
          <button
            className="text-button background-upload"
            type="button"
            onClick={() => backgroundInputRef.current?.click()}
          >
            <Upload size={14} aria-hidden="true" />
            {t.uploadBackground}
          </button>
          <input
            ref={backgroundInputRef}
            className="background-upload-input"
            type="file"
            aria-label={t.uploadBackground}
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onCustomBackgroundUpload(file);
              event.currentTarget.value = '';
            }}
          />
          {customBackgroundUrl && (
            <button className="icon-button remove-background" type="button" onClick={onRemoveCustomBackground} aria-label={t.removeBackground}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </fieldset>

      <button className="settings-action" type="button" onClick={onImportBookmarks}>
        <Download size={16} />
        {t.importBookmarks}
      </button>

      <details className="footer-guide">
        <summary>
          <PanelBottomClose size={16} />
          <span>{t.footerGuideTitle}</span>
          <ChevronDown className="footer-guide-chevron" size={16} />
        </summary>
        <div className="footer-guide-content">
          <p>{t.footerGuideIntro}</p>
          <ol>
            <li>{t.footerGuideRightClick}</li>
            <li>{t.footerGuideCustomize}</li>
          </ol>
          <p className="footer-guide-note">{t.footerGuideManaged}</p>
          <a href="https://support.google.com/chrome/answer/11032183" target="_blank" rel="noreferrer">
            {t.officialChromeHelp}
            <ExternalLink size={13} />
          </a>
        </div>
      </details>
    </section>
  );
}
