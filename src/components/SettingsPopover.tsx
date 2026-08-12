import { Download, Search, Settings, X } from 'lucide-react';
import type { Translation } from '../i18n';
import type { SearchEngineId } from '../types';

type SettingsPopoverProps = {
  open: boolean;
  t: Translation;
  searchEngine: SearchEngineId;
  onClose: () => void;
  onSearchEngineChange: (value: SearchEngineId) => void;
  onImportBookmarks: () => void;
};

export function SettingsPopover({
  open,
  t,
  searchEngine,
  onClose,
  onSearchEngineChange,
  onImportBookmarks,
}: SettingsPopoverProps) {
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

      <button className="settings-action" type="button" onClick={onImportBookmarks}>
        <Download size={16} />
        {t.importBookmarks}
      </button>
    </section>
  );
}
