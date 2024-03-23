import { Telegraf, Markup } from "telegraf"
import { config } from "dotenv"
import { userExists } from "./__utils__/index.js"
import { addUser, connectDB, getUser, getUserByAddr, getUsers, updateUserWallet } from "./__db__/index.js"
import { getBalance, getBet, getBettingStatus, getHistory } from "./__web3__/index.js"
import { ethers } from "ethers"
import { BETTING_ABI, BETTING_CA } from "./__web3__/config.js"
import { getProvider } from "./__web3__/init.js"

config()

const URL = process.env.TG_BOT_TOKEN

const bot = new Telegraf(URL)

bot.use(Telegraf.log())

bot.command("start", async ctx => {
    try {
        if (ctx.message.chat.type == "private") {
            const user_exists = await userExists(ctx.message.from.id)

            if(user_exists) {
                await ctx.replyWithHTML(`<b>Hello ${ctx.message.from.username} 👋, Welcome to the Crypto Betting Bot 🤖.</b>\n\n<i>Your betting account is already configured. You will get notified when you place any bets 🚀.</i>`)
            } else {
                await ctx.replyWithHTML(
                    `<b>Hello ${ctx.message.from.username} 👋, Welcome to the Crypto Betting Bot 🤖.</b>\n\n<i>Configure your betting account by connecting your betting wallet used in the DApp and start getting notified when you place any bets 🚀.</i>`,
                    {
                        parse_mode : "HTML",
                        ...Markup.inlineKeyboard([
                            [Markup.button.callback("Connect your betting wallet", "wallet")]
                        ])
                    }
                )
            }
        } else {
            await ctx.replyWithHTML(`<b>🚨 This bot is only used in private chats.</b>`)
        }
    } catch (err) {
        await ctx.replyWithHTML("<b>🚨 An error occured while using the bot.</b>")
        console.log(err)
    }
})

bot.action("wallet", async ctx => {
    await ctx.replyWithHTML(`<b>🔰 Input your betting wallet address here.</b>\n\n<i>⛔️ Warning : Ensure your wallet address is correct and the same one you use with the DApp.</i>`)
})

bot.hears(/^0x/, async ctx => {
    try {
        const address = ctx.message.text
        console.log(address)

        if(address.length == 42) {
            const user = await addUser(
                ctx.message.from.id,
                ctx.message.from.username,
                ctx.message.text
            )
            console.log(user)

            await ctx.replyWithHTML(`<b>Congratulations ${ctx.message.from.username} 🎉, You have successfully configured your betting account.</b>\n\n<i>You will get notified when you place any bets 🚀.</i>`)
        } else {
            await ctx.replyWithHTML("<b>⛔️ Invalid wallet address.</b>")
        }
    } catch (err) {
        await ctx.replyWithHTML("<b>🚨 An error occured while using the bot.</b>")
        console.log(err)
    }
})

bot.command("status", async ctx => {
    try {
        const status = await getBettingStatus()
        console.log(status)

        if(status == 0) {
            await ctx.replyWithHTML("<b>✅ Betting is active at the moment. You can place your bet on the hamsters.</b>")
        } else {
            await ctx.replyWithHTML("<b>⛔️ Betting is not active at the moment. You will be notified once betting begins.</b>")
        }
    } catch (err) {
        await ctx.replyWithHTML("<b>🚨 An error occured while using the bot.</b>")
        console.log(err)
    }
})

bot.command("address", async ctx => {
    try {
        const user = await getUser(ctx.message.from.id)
        console.log(user)

        await ctx.replyWithHTML(`<b>💼 The wallet address connected to your betting account is ${user.wallet}.</b>`)
    } catch (err) {
        await ctx.replyWithHTML("<b>🚨 An error occured while using the bot.</b>")
        console.log(err)
    }
})

bot.command("wallet", async ctx => {
    try {
        if(ctx.args.length == 1) {
            const user = await updateUserWallet(ctx.message.from.id, ctx.args[0])
            console.log(user, ctx.args)

            await ctx.replyWithHTML("<b>You have successfully update your betting wallet ✅.</b>")
        } else {
            await ctx.replyWithHTML("<b>🚨 Missing an argument, ie: /wallet 'wallet_address'.</b>")
        }
    } catch (err) {
        await ctx.replyWithHTML("<b>🚨 An error occured while using the bot.</b>")
        console.log(err)
    }
})

bot.command("balance", async ctx => {
    try {
        const user = await getUser(ctx.message.from.id)
        console.log(user)

        const balance = await getBalance(user.wallet)
        console.log(balance)

        await ctx.replyWithHTML(`<b>Your betting balance is ${balance} ETH 💰.</b>`)
    } catch (err) {
        await ctx.replyWithHTML("<b>🚨 An error occured while using the bot.</b>")
        console.log(err)
    }
})

bot.command("history", async ctx => {
    try {
        const outcome = ["Won", "Lost", "Pending"]
        const hamsters = ["Nil", "CK", "ANSEM", "TRUMP"]
        const user = await getUser(ctx.message.from.id)
        console.log(user)

        const bets = await getHistory(user.wallet)
        console.log(bets)

        let text = `<b>🎲 --Bet History-- 🎲</b>\n\n`

        bets.forEach(bet => {
            const _text = `<b>🎖 BetID:</b><i>${bet[0]}</i>\n\n<b>💰 Wager:</b><i>${ethers.formatEther(bet[1])} ETH</i>\n\n<b>🐭 Hamster:</b><i>${hamsters[Number(bet[2])]}</i>\n\n<b>🏅 Outcome:</b><i>${outcome[Number(bet[3])]}</i>\n\n`
            text += _text
        })

        if(bets.length > 0) {
            await ctx.replyWithHTML(text)
        } else {
            await ctx.replyWithHTML("<b>🎲 --No Bet History-- 🎲</b>")
        }
    } catch (err) {
        await ctx.replyWithHTML("<b>🚨 An error occured while using the bot.</b>")
        console.log(err)
    }
})

bot.command("current", async ctx => {
    try {
        const outcome = ["Won", "Lost", "Pending"]
        const hamsters = ["Nil", "CK", "ANSEM", "TRUMP"]
        const user = await getUser(ctx.message.from.id)
        console.log(user)

        const bet = await getBet(user.wallet)
        console.log(bet)

        const text = `<b>🎲 --Latest Bet-- 🎲</b>\n\n<b>🎖 BetID:</b><i>${bet[0]}</i>\n\n<b>💰 Wager:</b><i>${ethers.formatEther(bet[1])} ETH</i>\n\n<b>🐭 Hamster:</b><i>${hamsters[Number(bet[2])]}</i>\n\n<b>🏅 Outcome:</b><i>${outcome[Number(bet[3])]}</i>`

        if(bet) {
            await ctx.replyWithHTML(text)
        } else {
            await ctx.replyWithHTML("<b>🎲 --No Available Bet-- 🎲</b>")
        }
    } catch (err) {
        await ctx.replyWithHTML("<b>🚨 An error occured while using the bot.</b>")
        console.log(err)
    }
})

const notifications = async () => {
    const hamsters = ["Nil", "CK", "ANSEM", "TRUMP"]
    const betting = new ethers.Contract(
        BETTING_CA,
        BETTING_ABI,
        getProvider()
    )
    console.log(betting)

    betting.on("Betting_Round_Started", async (duration, e) => {
        console.log(duration)
        const users = await getUsers()
        console.log(users)

        users.forEach(async user => {
            const text = `<b>A betting round has started and will end in ${duration} minutes. Place your bets 🚀.</b>\n\n<a href='https://www.racinghamsters.com/bet'>🎲 Place Bet</a>`
            await bot.telegram.sendMessage(user.userId, text, {
                parse_mode: "HTML"
            })
        })
    })

    betting.on("Betting_Round_Ended", async (winner, e) => {
        console.log(winner)

        const users = await getUsers()
        console.log(users)

        users.forEach(async user => {
            const text = `<b>The betting round has ended. The winner is ${hamsters[winner]} 🚀.</b>`
            await bot.telegram.sendMessage(user.userId, text, {
                parse_mode: "HTML"
            })
        })
    })

    betting.on("Bet_Placed", async (_user, amount, bet, e) => {
        console.log(_user, amount, bet)

        const user = await getUserByAddr(_user)
        console.log(user)

        if(user) {
            const text = `<b>You just placed a bet for ${hamsters[bet]} with ${ethers.formatEther(amount)} ETH 🚀.</b>`
            await bot.telegram.sendMessage(user.userId, text, {
                parse_mode: "HTML"
            })
        }
    })

    betting.on("Withdrawal", async (_user, amount, e) => {
        console.log(_user, amount)

        const user = await getUserByAddr(_user)
        console.log(user)

        if(user) {
            const text = `<b>You just withdrew ${ethers.formatEther(amount)} ETH from your betting account 🎉.</b>`
            await bot.telegram.sendMessage(user.userId, text, {
                parse_mode: "HTML"
            })
        }
    })
}

connectDB()

setTimeout(() => {
    notifications()
}, 1000);

bot.launch()

process.once("SIGINT", () => bot.stop("SIGINT"))

process.once("SIGTERM", () => bot.stop("SIGTERM"))