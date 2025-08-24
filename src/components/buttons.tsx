export const PrimaryButton = ({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) => {
  return (
    <button onClick={onClick} disabled={disabled} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center text-sm font-semibold "> 
        {children}
    </button>
  );
}
export const SecondaryButton = ({ children, onClick, disabled, small }: { children: React.ReactNode; onClick: () => void; disabled?: boolean, small?:boolean }) => {
  return (
    <button onClick={onClick} disabled={disabled} className={`bg-gray-200 text-gray-700 px-${small?2:4} py-${small?1:2} rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center text-${small?'xs':'sm'}`}> 
        {children}
    </button>
  );
}