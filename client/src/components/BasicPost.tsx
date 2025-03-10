import config from "@/config";

export default function BasicPost({
  image,
  title,
  author,
}: {
  image: string;
  title: string;
  author: string;
}) {
  return (
    <div>
      {image && (
        <img
          className="rounded-t-lg"
          src={image}
          alt=""
          width={500}
          height={250}
        />
      )}
      <div className="flex flex-col flex-grow p-6 pt-2">
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-left">{title}</h3>
          <p className="text-sm text-gray-500 text-left">By {author}</p>
        </div>
      </div>
    </div>
  );
}
