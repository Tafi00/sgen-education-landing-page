import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";

type SelectOption = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  icon: LucideIcon;
  name: string;
  options: SelectOption[];
  placeholder: string;
  required?: boolean;
};

export function CustomSelect({ icon: Icon, name, options, placeholder, required = false }: CustomSelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const [invalid, setInvalid] = useState(false);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form || !required) return;

    const validateSelection = (event: SubmitEvent) => {
      if (!value) {
        event.preventDefault();
        setInvalid(true);
        setOpen(true);
        triggerRef.current?.focus();
      }
    };

    form.addEventListener("submit", validateSelection);
    return () => form.removeEventListener("submit", validateSelection);
  }, [required, value]);

  const choose = (index: number) => {
    setValue(options[index].value);
    setHighlighted(index);
    setInvalid(false);
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlighted((current) => {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        return (current + direction + options.length) % options.length;
      });
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(highlighted);
      else setOpen(true);
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setOpen(true);
      setHighlighted(event.key === "Home" ? 0 : options.length - 1);
    }
  };

  return (
    <div ref={rootRef} className={`field-control custom-select ${open ? "is-open" : ""} ${invalid ? "is-invalid" : ""}`}>
      <input type="hidden" name={name} value={value} />
      <button
        ref={triggerRef}
        type="button"
        className="custom-select__trigger"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-required={required}
        aria-invalid={invalid}
        aria-activedescendant={open ? `${listboxId}-${highlighted}` : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
      >
        <Icon aria-hidden="true" />
        <span className={selected ? "" : "is-placeholder"}>{selected?.label ?? placeholder}</span>
        <ChevronDown className="custom-select__chevron" aria-hidden="true" />
      </button>

      {open ? (
        <div id={listboxId} className="custom-select__menu" role="listbox" aria-label={placeholder}>
          {options.map((option, index) => (
            <button
              id={`${listboxId}-${index}`}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={`custom-select__option ${highlighted === index ? "is-highlighted" : ""}`}
              onMouseEnter={() => setHighlighted(index)}
              onClick={() => choose(index)}
              key={option.value}
            >
              <span>{option.label}</span>
              {value === option.value ? <Check aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
