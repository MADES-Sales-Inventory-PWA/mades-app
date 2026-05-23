export const BasicButton = ({ children, onClick, className, title, id, disabled }: { children: React.ReactNode; onClick: () => void; className?: string; title?: string; id?: string; disabled?: boolean }) => {
  return (
    <button id={id} title={title} onClick={onClick} disabled={disabled} className={`rounded-full hover:cursor-pointer ${className}`}>
      {children}
    </button>
  );
};