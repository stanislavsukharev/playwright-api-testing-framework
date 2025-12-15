import { config } from "../api-test.config";
import { APIlogger } from "../utils/logger";
import { RequestHandler } from "../utils/request-handler";
import { request } from "@playwright/test";


export async function createToken(email: string, password: string): Promise<string> {
    const context = await request.newContext();
    const logger = new APIlogger();
    const api = new RequestHandler(context, config.apiUrl, logger);

    try {
        const tokenResponse = await api
            .path('/users/login')
            .body({
                user: {
                    email,
                    password
                }
            })
            .postRequest(200);

        return 'Token ' + tokenResponse.user.token;

    } catch (error) {
        if (error instanceof Error) {
            Error.captureStackTrace(error, createToken);
            throw error; // ❗ Важный момент — теперь функция НЕ может вернуть undefined
        }
        throw new Error("Unknown error while creating token");
    } finally {
        await context.dispose();
    }
}
