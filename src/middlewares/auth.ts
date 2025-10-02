import { ORPCError, os } from "@orpc/server";
import { User } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const requiredAuthMiddleware = os
    .$context<{ session?: { user?: User } }>()
    .middleware(async ({ context, next }) => {
        /**
         * Why we should ?? here?
         * Because it can avoid `getSession` being called when unnecessary.
         * {@link https://orpc.unnoq.com/docs/best-practices/dedupe-middleware}
         */
        const session = context.session ?? (await getSession());

        if (!session.user) {
            throw new ORPCError("UNAUTHORIZED");
        }

        return next({
            context: { user: session.user },
        });
    });

async function getSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    return session;
}

export const authed = os.use(requiredAuthMiddleware);