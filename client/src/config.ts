interface Config {
  SERVER_URL: string;
}

const config: Config = {
  SERVER_URL: import.meta.env.VITE_SERVER_URL || "",
};

export default config;
