import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';
import { uploadDisabled } from '../../utils';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    if (uploadDisabled) throw new Error('Sorry, uploads are disabled');

    const parameters = await request.json();
    const blobStore = getStore('shapes');
    const key = parameters.name;
    await blobStore.setJSON(key, parameters);
    return new Response(
        JSON.stringify({
            message: `Stored shape "${key}"`
        })
    );
};

export const GET: APIRoute = async ({ request }) => {
    try {
        const blobStore = getStore({ name: 'shapes', consistency: 'strong' });
        const data = await blobStore.list();
        const keys = data.blobs.map(({ key }) => key);
        return new Response(
            JSON.stringify({
                keys
            })
        );
    } catch (e) {
        console.error(e);
        return new Response(
            JSON.stringify({
                keys: [],
                error: 'Failed listing blobs'
            })
        );
    }
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