export const SummaryCard = ({ title, number, text, icon, withBackground, className }: { title: string; number: string; text: React.ReactNode; icon?: React.ReactNode; withBackground?: boolean; className?: string }) => {
    return (
        <div className={`inline-flex flex-col w-fit py-3 pl-5 pr-8 ${withBackground ? 'bg-white rounded-xl shadow-md mt-3 mr-7' : ''} ${className || ''}`}>
            <div className="flex flex-row items-center">
                <h1 className="text-md font-semibold text-gray-600">{title}</h1>
                {icon &&
                    <div className="bg-primary-blue-100 flex items-center p-1 border-primary-blue border-[1px] rounded-xl ml-3">
                        <div >{icon}</div>
                    </div>
                }
            </div>
            <h1 className="text-3xl font-semibold text-black-700 mt-4">{number}</h1>
            {text}
        </div>
    );
}