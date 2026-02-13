import { client } from "../config/db.js";

async function signupUserService({ email, password }: {
    email: string,
    password: string
}) {

    try {

        const userObj = await client.user.create({
            data: {
                email: email,
                password: password
            }
        });

        return userObj;

    } catch (error) {
        throw new Error("Error creating user");
    }

}

async function signinUserService({ email, password }: {
    email: string,
    password: string
}) {

    try {

        const userObj = await client.user.findFirst({
            where: {
                email: email
            }
        });

        if (!userObj) {
            return false;
        }

        if (userObj.password !== password) {
            return false;
        }

        return userObj;

    } catch (error) {
        throw new Error("Error creating user");
    }

}

export { signupUserService, signinUserService };