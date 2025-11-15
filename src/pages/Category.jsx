import { useParams } from "react-router-dom";
import categories from "../data/Categories.json";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { removePolishChars } from "../helpers/textHelper.js";

import Questionary from "@/components/Questionary";

export default function Category() {

    const navigate = useNavigate();
    const { category } = useParams();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isQuestOpen, setIsQuestOpen] = useState(false);
    const [preQuest, setPreQuest] = useState(null);

    const selectTag = (tag) => {
        let prev = { cat: selectedCategory.category, tag: tag };
        setPreQuest(prev);
        setIsQuestOpen(true);
    };

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
        <>
            <div className="w-full h-auto min-h-screen flex items-center bg-whitesmoke justify-center">
                <div className="w-7xl h-auto flex flex-col">
                    <p className="text-5xl text-left font-marker tracking-widest">{removePolishChars(selectedCategory.name)}</p>
                    <p className="text-xl text-left font-helvetica tracking-wide ml-2 mt-6">{selectedCategory.desc}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2 mb-12 mt-12">
                        {selectedCategory.tags.map((tag) => {
                            return (
                                <div onClick={() => selectTag(tag.tagName)} key={tag.name} className="card h-42 bg-base-100 hover:shadow-lg transition cursor-pointer">
                                    <div className="card-body">
                                        <h3 className="card-title text-base">{tag.name}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <Questionary open={isQuestOpen} onClose={() => setIsQuestOpen(false)} pre={preQuest} />
        </>
    );
}