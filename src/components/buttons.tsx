export const PrimaryButton = ({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) => {
  const base =
    'px-4 py-2 rounded-md transition-colors flex items-center justify-center text-sm font-semibold';
  const enabled = 'bg-green-600 text-white hover:bg-green-700';
  const disabledCls = 'bg-gray-300 text-gray-400 cursor-not-allowed opacity-70';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${disabled ? disabledCls : enabled}`}
    >
      {children}
    </button>
  );
};
export const SecondaryButton = ({
  children,
  onClick,
  disabled,
  small,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  small?: boolean;
}) => {
  const sizeClasses = small ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm';
  const enabled = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
  const disabledCls = 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${sizeClasses} rounded-md transition-colors flex items-center justify-center ${disabled ? disabledCls : enabled}`}
    >
      {children}
    </button>
  );
};
