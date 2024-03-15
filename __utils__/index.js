import { getUser } from "../__db__/index.js"

export const userExists = async userId => {
    const user = await getUser(userId)
    console.log(user)

    return user ? true : false
}