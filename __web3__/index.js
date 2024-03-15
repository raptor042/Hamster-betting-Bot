import { getUsers } from "../__db__/index.js"
import { BETTING_ABI, BETTING_CA } from "./config.js"
import { getProvider } from "./init.js"
import { ethers } from "ethers"

export const getBettingStatus = async () => {
    const betting = new ethers.Contract(
        BETTING_CA,
        BETTING_ABI,
        getProvider()
    )

    const status = await betting.status()

    return Number(status)
}

export const getBalance = async (address) => {
    const betting = new ethers.Contract(
        BETTING_CA,
        BETTING_ABI,
        getProvider()
    )

    const user = await betting.users(address)
    console.log(user)

    return ethers.formatEther(user[1])
}

export const getHistory = async (address) => {
    const betting = new ethers.Contract(
        BETTING_CA,
        BETTING_ABI,
        getProvider()
    )

    const bets = await betting.getBets(address)
    console.log(bets)

    return bets
}

export const getBet = async (address) => {
    const betting = new ethers.Contract(
        BETTING_CA,
        BETTING_ABI,
        getProvider()
    )

    const bets = await betting.getBets(address)
    console.log(bets)

    return bets[bets.length - 1]
}