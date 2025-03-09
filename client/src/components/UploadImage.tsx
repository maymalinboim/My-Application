import config from "@/config";
import { useRef, useState } from "react";

interface UploadProfileProps {
    setImage: (image: File | null) => void;
    imageUrl?: string,
}

const UploadImage: React.FC<UploadProfileProps> = ({ setImage, imageUrl }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            setImage(file);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-5">
            <div onClick={() => fileInputRef.current?.click()} style={{ cursor: "pointer" }}>
                {preview ? (
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-xl shadow-md"
                    />
                ) : imageUrl ? (
                    <img
                        src={`${config.SERVER_URL}/${imageUrl}`}
                        alt="image"
                        className="w-24 h-24 object-cover rounded-xl shadow-md"
                    />
                ) : (
                    <label
                        htmlFor="fileUpload"
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-5 w-64 text-center hover:border-blue-500 transition-all"
                    >
                        <span className="text-gray-600">Upload Image</span>
                    </label>
                )}
            </div>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
                ref={fileInputRef}
            />
        </div>
    );
};

export default UploadImage;