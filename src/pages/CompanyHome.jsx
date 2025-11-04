import TaskBrowser from "@/components/TaskBrowser";
import { useState } from "react";

export default function CompanyHome() {
    const [isLoading, setIsLoading] = useState(false);

    const search = (data) => {
        console.log("Recived ---> " + JSON.stringify(data));
    };

    return (
        <>
        <div className="w-full min-h-screen bg-whitesmoke flex items-start justify-center">
            <div className="w-full max-w-7xl px-6 mt-12 gap-3 flex flex-col">
                <TaskBrowser onSearch={search}/>
                <div className="w-full flex flex-col">

                </div>
            </div>
        </div>
        </>
    );
}