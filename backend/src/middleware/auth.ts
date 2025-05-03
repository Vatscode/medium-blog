import { Context } from 'hono';
import { verify } from 'hono/jwt';

export const authMiddleware = async (c: Context, next: Function) => {
    const authHeader = c.req.header('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        c.status(401);
        return c.json({
            message: "Unauthorized - No token provided"
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = await verify(token, c.env.JWT_SECRET);
        c.set('userId', payload.id);
        await next();
    } catch (e) {
        c.status(401);
        return c.json({
            message: "Unauthorized - Invalid token"
        });
    }
}; 