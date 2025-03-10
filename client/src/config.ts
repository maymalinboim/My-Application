interface Config {
  SERVER_URL: string;
  API_KEY: string;
}

const config: Config = {
  SERVER_URL: import.meta.env.VITE_SERVER_URL || "",
  API_KEY: import.meta.env.VITE_API_KEY || "",
};

export default config;
