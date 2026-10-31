export function Switch({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <span className="relative inline-flex h-7 w-12 shrink-0 select-none">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="peer absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0"
        role="switch"
      />
      {/* track */}
      <span
        className="size-full rounded-full bg-paper-3 ring-1 ring-rule transition-colors duration-200 ring-inset peer-checked:bg-accent-deep peer-checked:ring-accent-deep peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus"
        aria-hidden="true"
      />
      {/* knob */}
      <span
        className="absolute start-1 top-1 size-5 rounded-full bg-paper shadow-sm transition-transform duration-200 ease-out peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5"
        aria-hidden="true"
      />
    </span>
  );
}
