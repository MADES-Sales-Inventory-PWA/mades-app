export const SummaryCard = ({ title, number, text, icon }: { title: string; number: number; text: string; icon?: React.ReactNode }) => {
    return (
        <div className="inline-flex flex-col w-fit py-3 pl-5 pr-8 bg-white rounded-xl shadow-md mt-3 mr-7">
            <div>
                <div className="flex flex-row items-center">
                    <h1 className="text-md font-semibold text-gray-600">{title}</h1>
                    <div className="bg-primary-blue-100 flex items-center p-1 border-primary-blue border-[1px] rounded-xl ml-3">
                        {icon && <div >{icon}</div>}
                    </div>
                </div>
                <h1 className="text-3xl font-semibold text-black-700 mt-4">{number}</h1>
                <h3 className="text-xs font-semibold text-gray-700 bg-gray-200 rounded-xl p-1">{text}</h3>
            </div>
        </div>
    );
}