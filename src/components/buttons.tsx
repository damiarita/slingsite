export const PrimaryButton = ({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) => {
  return (
    <button onClick={onClick} disabled={disabled} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center text-sm font-semibold "> 
        {children}
    </button>
  );
}
export const SecondaryButton = ({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) => {
  return (
    <button onClick={onClick} disabled={disabled} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"> 
        {children}
    </button>
  );
}