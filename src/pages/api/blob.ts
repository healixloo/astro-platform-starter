import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';

export const prerender = false;

export const GET: APIRoute = async (context) => {
    const urlParams = new URL(context.url);
    const key = urlParams.searchParams.get('key');
    if (!key) {
        return new Response('Bad Request', { status: 400 });
    }

    const blobStore = getStore('shapes');
    const blob = await blobStore.get(key, { type: 'json' });
    return new Response(
        JSON.stringify({
            blob
        })
    );
};



export const DELETE: APIRoute = async ({ request }) => {
    const { key } = await request.json();
    if (!key) {
        return new Response('Bad Request', { status: 400 });
    }

    const blobStore = getStore('shapes');
    await blobStore.delete(key);
    return new Response(
        JSON.stringify({
            message: `Deleted shape "${key}"`
        }),
        { status: 200 }
    );
};
