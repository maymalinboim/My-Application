import React, { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UploadProfileProps {
  username: string;
  setImage: (image: File | null) => void;
  imageUrl: string | undefined,
}

const UploadProfile: React.FC<UploadProfileProps> = ({ username, setImage, imageUrl }) => {console.log(imageUrl);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };


  return (
    <div style={{ textAlign: "center" }}>
      <div onClick={() => fileInputRef.current?.click()} style={{ cursor: "pointer" }}>
        <Avatar className="w-32 h-32">
          {preview ? (
            <AvatarImage src={preview} alt="Profile Preview" />
          ) : (
            imageUrl ? (
              <>
                <AvatarImage src={imageUrl} />
              </>
            ) :
              <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
        ref={fileInputRef}
      />
    </div>
  );
};

export default UploadProfile;
