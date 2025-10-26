import { useParams } from "react-router-dom";
import categories from "../data/Categories.json";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { removePolishChars } from "../helpers/textHelper.js";

export default function Category() {

    const navigate = useNavigate();
    const { category } = useParams();
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        if(!category){ navigate("/error"); }
        const found = categories.find(a => a.category === category);

        if (!found) {
            navigate("/error");
        } else {
            setSelectedCategory(found);
        }
    }, [category, navigate]);

    if (!selectedCategory) return null;

    return (
        <div className="w-full h-auto min-h-screen flex items-center bg-whitesmoke justify-center">
            <div className="w-7xl h-auto flex flex-col">
                <p className="text-5xl text-left font-marker tracking-widest">{removePolishChars(selectedCategory.name)}</p>
                <p className="text-xl text-left font-helvetica tracking-wide ml-2 mt-6">{selectedCategory.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2 mb-12 mt-12">
                    {selectedCategory.tags.map((tag) => {
                        return (
                            <Link key={tag} className="card h-42 bg-base-100 hover:shadow-lg transition cursor-pointer">
                                <div className="card-body">
                                    <h3 className="card-title text-base">{tag}</h3>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}