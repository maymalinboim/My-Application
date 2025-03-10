import config from "@/config";
import axios from "axios";

export const getPostFromRestApi = async (
  perPage: number,
  currentPage: number
) => {
  const query =
    "travel OR vacation OR trip OR destination OR adventure OR nature OR cityscape OR landmarks OR tourism";

  const res = await axios.get(
    `https://api.pexels.com/v1/search?query=${query}&per_page=${perPage}&page=${currentPage}`,
    {
      headers: { Authorization: config.API_KEY },
    }
  );

  return res.data.photos;
};
