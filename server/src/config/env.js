import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT || 5000,
    PASSWORD: process.env.PASSWORD,
    BASE_URL: process.env.BASE_URL,
    API_FOOTBALL_KEY: process.env.API_FOOTBALL_KEY
}