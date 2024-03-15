import { connect } from "mongoose"
import { UserModel } from "./models/index.js"
import { config } from "dotenv"

config()

const URI = process.env.MONGO_URI

export const connectDB = async () => {
    try {
        await connect(`${URI}`)
        console.log("Connection to the Database was successful.")
    } catch(err) {
        console.log(err)
    }
}

export const getUser = async userId => {
    try {
        const user = await UserModel.findOne({ userId })

        return user
    } catch (err) {
        console.log(err)
    }
}

export const getUserByAddr = async wallet => {
    try {
        const user = await UserModel.findOne({ wallet })

        return user
    } catch (err) {
        console.log(err)
    }
}

export const getUsers = async () => {
    try {
        const user = await UserModel.find()
        return user
    } catch (err) {
        console.log(err)
    }
}

export const addUser = async (userId, username, wallet) => {
    try {
        const user = new UserModel({
            userId,
            username,
            wallet
        })

        const data = await user.save()

        return data
    } catch (err) {
        console.log(err)
    }
}

export const updateUserWallet = async (userId, wallet) => {
    try {
        const user = await UserModel.findOneAndUpdate(
            { userId },
            { $set : { wallet } }
        )

        return user
    } catch (err) {
        console.log(err)
    }
}

export const deleteUser = async userId => {
    try {
        const user = await UserModel.deleteOne({ userId })

        return user
    } catch (err) {
        console.log(err)
    }
}