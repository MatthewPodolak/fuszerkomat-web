import { useParams } from "react-router-dom";
import ProfileInfoPanel from "@/components/dashboard/company/ProfileInfoPanel";


export default function CompanyDisplay() {
    const { id } = useParams();

    if (!id) return null;

    return (
        <div className="w-full min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <div className="w-3/4 min-h-64 py-12">
                <ProfileInfoPanel own={false} id={id}/>
            </div>
        </div>
    );
}