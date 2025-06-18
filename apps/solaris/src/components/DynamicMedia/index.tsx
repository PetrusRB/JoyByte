'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Loading } from '../Loading';

// Lazy load do react-player
// const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });
const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {ssr:false});

type MediaDisplayProps = {
  url: string;
  className?: string;
  width: number;
  height: number;
  alt?: string;
  autoPlay?: boolean;
};

const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const videoExts = ['mp4', 'webm', 'ogg', 'mov'];

function getFileTypeFromUrl(url: string): 'image' | 'video' | 'unknown' {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
  if (ext && imageExts.includes(ext)) return 'image';
  if (ext && videoExts.includes(ext)) return 'video';
  return 'unknown';
}

async function fetchContentType(url: string): Promise<'image' | 'video' | 'unknown'> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const type = res.headers.get('content-type') || '';
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
  } catch (err) {
    console.warn('Erro ao buscar content-type:', err);
  }
  return 'unknown';
}

export default function DynamicMedia({
  url,
  autoPlay = false,
  alt = 'Mídia detectada',
  width,
  height,
  className,
}: MediaDisplayProps) {
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'unknown'>('unknown');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const byExt = getFileTypeFromUrl(url);
      if (byExt !== 'unknown') {
        if (mounted) {
          setMediaType(byExt);
          setLoading(false);
        }
        return;
      }
      const fetched = await fetchContentType(url);
      if (mounted) {
        setMediaType(fetched);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [url]);

  if (loading) {
    return <Loading text="Carregando mídia..." />;
  }

  if (mediaType === 'image') {
    return (
      <Image
        src={url}
        width={width}
        height={height}
        alt={alt}
        className={className}
        placeholder='blur'
        blurDataURL={url}
      />
    );
  }

  if (mediaType === 'video') {
    return (
      <VideoPlayer
        src={url}
        autoPlay={autoPlay}
        loop
        className={className}
      />
    );
  }

  return (
    <div className="text-red-500">
      Tipo de mídia não reconhecido ou não suportado
    </div>
  );
}
