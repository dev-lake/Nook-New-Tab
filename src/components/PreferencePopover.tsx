import { Check, X } from 'lucide-react';

type PreferenceOption<T extends string> = {
  value: T;
  label: string;
};

type PreferencePopoverProps<T extends string> = {
  open: boolean;
  label: string;
  closeLabel: string;
  value: T;
  options: PreferenceOption<T>[];
  onChange: (value: T) => void;
  onClose: () => void;
};

export function PreferencePopover<T extends string>({
  open,
  label,
  closeLabel,
  value,
  options,
  onChange,
  onClose,
}: PreferencePopoverProps<T>) {
  if (!open) return null;

  return (
    <section className="preference-popover" aria-label={label}>
      <header>
        <strong>{label}</strong>
        <button type="button" className="icon-button" onClick={onClose} aria-label={closeLabel}>
          <X size={16} />
        </button>
      </header>
      <div className="preference-options">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="preference-option"
            aria-pressed={option.value === value}
            onClick={() => {
              onChange(option.value);
              onClose();
            }}
          >
            <span>{option.label}</span>
            {option.value === value && <Check size={15} aria-hidden="true" />}
          </button>
        ))}
      </div>
    </section>
  );
}
