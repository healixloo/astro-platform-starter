import React, { useState, useEffect } from 'react';
import ShapePreview from './ShapePreview';
import { generateBlob } from '../../../utils';
import type { BlobProps } from '../../../types';

interface Props {
    lastMutationTime: number;
}

export default function StoredShapes(props: Props) {
    const { lastMutationTime } = props;
    const [keys, setKeys] = useState<string[]>([]);
    const [selectedKey, setSelectedKey] = useState<string>(null);
    const [previewData, setPreviewData] = useState<BlobProps>(null);

    const getBlobKeyList = async () => {
        console.log('Fetching keys...');
        const response = await fetch('/api/blobs', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.keys) {
            setKeys(data.keys);
        }
    };

    const getBlobByKey = async (key: string) => {
        setSelectedKey(key);
        const params = new URLSearchParams({ key });
        const response = await fetch(`/api/blob/?${params}`, {
            method: 'GET'
        });
        const data = await response.json();
        if (data.blob) {
            setPreviewData(generateBlob(data.blob));
        }
    };

    const deleteBlobByKey = async (key: string) => {
        const response = await fetch('/api/blob', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        });
        const data = await response.json();
        if (data.message) {
            setKeys(keys.filter(k => k !== key));
            if (selectedKey === key) {
                setSelectedKey(null);
                setPreviewData(null);
            }
        } else {
            alert('Failed to delete the blob');
        }
    };

    useEffect(() => {
        getBlobKeyList();
    }, [lastMutationTime]);

    return (
        <>
            <h2 className="mb-4 text-xl text-center sm:text-xl">Objects in Blob Store</h2>
            <div className="w-full bg-white rounded-lg">
                <div className="min-h-14 p-4 text-center">
                    {keys?.length ? (
                        <div className="space-y-1">
                            {keys.map((keyName) => (
                                <div key={keyName} className="flex justify-between">
                                    <button
                                        className={
                                            'btn btn-ghost btn-sm btn-block text-neutral-900 font-normal' +
                                            (selectedKey === keyName ? ' bg-base-content/20 pointer-events-none' : '')
                                        }
                                        onClick={() => getBlobByKey(keyName)}
                                    >
                                        {keyName}
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteBlobByKey(keyName)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span className="text-neutral-900">Please upload some shapes!</span>
                    )}
                </div>
                {previewData && (
                    <div className="p-4 aspect-square text-primary border-t border-neutral-200">
                        <ShapePreview {...previewData} />
                    </div>
                )}
            </div>
        </>
    );
}
