
export default function SettingsPanel(){
    
    return (
        <div className="w-full h-auto flex flex-col lg:flex-row gap-3">
            <div className="w-91 h-24 bg-primary rounded-3xl shadow-md cursor-pointer hover:shadow-2xl flex justify-end items-end py-3 px-4">
                <p className="font-marker tracking-widest text-accent text-lg">zmien haslo</p>
            </div>
            <div className="w-91 h-24 bg-primary rounded-3xl shadow-md cursor-pointer hover:shadow-2xl flex justify-end items-end py-3 px-4">
                <p className="font-marker tracking-widest text-red-500 text-lg">usun konto</p>
            </div>
        </div>
    )
}