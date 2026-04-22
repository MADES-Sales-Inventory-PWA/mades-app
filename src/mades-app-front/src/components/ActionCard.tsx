export const ActionCard = ({ title, text, icon, className, onClick }: { title: string; text: string; icon?: React.ReactNode; className?: string; onClick: () => void }) => {
    return (
        <button 
        className={`flex flex-col justify-start text-left p-6 bg-white rounded-xl shadow-sm mt-4 hover:bg-gray-100 hover:cursor-pointer ${className || ''}`}
        onClick={onClick}>
            <div className="inline-flex w-fit self-start p-3 bg-primary-blue rounded-full text-white">
                {icon && <div>{icon}</div>}
            </div>
            <h1 className="text-lg font-bold mt-3 text-gray-800">{title}</h1>
            <p className="text-gray-600">{text}</p>
        </button>
    )
}