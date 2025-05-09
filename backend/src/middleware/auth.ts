import { Context } from 'hono';
import { verify } from 'hono/jwt';

export const authMiddleware = async (c: Context, next: Function) => {
    console.log('=== Auth Middleware Start ===');
    const authHeader = c.req.header('authorization');
    console.log('Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No valid auth header found');
        c.status(401);
        return c.json({
            message: "Unauthorized - No valid token provided"
        });
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted token:', token);

    try {
        const decoded = await verify(token, c.env.JWT_SECRET);
        console.log('Decoded token payload:', decoded);
        
        if (!decoded || typeof decoded !== 'object') {
            console.log('Invalid decoded token format:', decoded);
            throw new Error('Invalid token format');
        }
        
        // @ts-ignore
        const userId = decoded.id;
        console.log('Extracted userId:', userId);
        
        if (!userId) {
            console.log('No userId found in token');
            throw new Error('No userId in token');
        }
        
        c.set('userId', userId);
        console.log('Successfully set userId in context:', userId);
        console.log('=== Auth Middleware End ===');
        await next();
    } catch (e) {
        console.error("Auth error:", e);
        c.status(401);
        return c.json({
            message: "Unauthorized - Invalid token"
        });
    }
}; 