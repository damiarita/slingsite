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
    <div className="relative inline-block w-12 h-6 align-middle select-none">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="absolute inset-0 w-full h-full m-0 p-0 opacity-0 cursor-pointer peer z-10"
        aria-checked={checked}
        role="switch"
      />
      {/* track */}
      <div
        className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors"
        aria-hidden="true"
      />
      {/* knob */}
      <div
        className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform peer-checked:translate-x-6"
        aria-hidden="true"
      />
    </div>
  );
}
