import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge'
}

const georgiaFont = fetch(new URL('../../assets/georgiab.ttf', import.meta.url)).then(
  (res) => res.arrayBuffer()
)
const robotoFont = fetch(new URL('../../assets/Roboto-Light.ttf', import.meta.url)).then(
  (res) => res.arrayBuffer()
)

export default async function (request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tag = searchParams.get('tag') || ''
  const title = 'Loopie'
  const description = `${tag ? `${tag} ` : ''}news for the early enthusiast`

  const georgiaFontData = await georgiaFont
  const robotoFontData = await robotoFont

  // noinspection TypeScriptValidateTypes
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          color: 'black',
          background: '#FFFDF6',
          width: '100%',
          height: '100%',
          padding: 10,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <img
          width="256"
          height="256"
          src={'https://loopie.site/loopie_logo.png'}
        />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
            <h1 style={{ fontFamily: 'ui-serif,Georgia,Cambria,Times New Roman,Times,serif' }}
                tw="text-9xl text-gray-900">
              {title}
            </h1>
            <p style={{ fontFamily: 'ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif' }}
              tw="max-w-xl font-sans text-6xl text-gray-500 text-center">
              {description}
            </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Georgia',
          data: georgiaFontData
        },
        {
          name: 'Roboto',
          data: robotoFontData
        }
      ]
    }
  )
}
