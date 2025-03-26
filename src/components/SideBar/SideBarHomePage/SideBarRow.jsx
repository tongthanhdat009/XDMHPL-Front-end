export function SideBarRow({src,Icon,title, onClick}) {
    return (
        <div className="flex items-center space-x-2 p-4 hover:bg-gray-200 rounded-xl cursor-pointer" onClick={onClick}>
            {
                src && (
                    <img 
                        className="rounded-full"
                        src={src}
                        width={30}
                        height={30}
                        layout="fixed"
                    />
                )
            }
            {Icon && (<Icon className="h-8 w-8 text-blue-500" />)}
            <p className="hidden sm:inline-flex font-medium">{title}</p>
        </div>
    )
}