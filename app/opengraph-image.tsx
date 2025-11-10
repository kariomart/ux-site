import { ImageResponse } from 'next/og'
import profileData from '../public/content/profileData.json';

export const runtime = 'edge'

export const alt = profileData.general.byline;
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 60,
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        <div>{profileData.general.byline}</div>
      </div>
    ),
    {
      ...size,
    }
  )
}
