import { ethers } from "ethers"
import { config } from "dotenv"

config()

export const getProvider = () => {
    return new ethers.JsonRpcProvider(process.env.BASE_MAINNET_API_URL)
}