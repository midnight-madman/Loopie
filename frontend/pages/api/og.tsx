import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'experimental-edge'
}

const georgiaFont = fetch(new URL('../../assets/georgiab.ttf', import.meta.url)).then(
  (res) => res.arrayBuffer()
)
const robotoFont = fetch(new URL('../../assets/Roboto-Light.ttf', import.meta.url)).then(
  (res) => res.arrayBuffer()
)

export default async function () {
  const georgiaFontData = await georgiaFont
  const robotoFontData = await robotoFont

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          color: 'black',
          background: '#FFFDF6',
          width: '100%',
          height: '100%',
          paddingTop: 50,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <img
          width="256"
          height="256"
          src={'https://loopie.site/loopie_logo.png'}
          style={{
            borderRadius: 128
          }}
        />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
            <h1 style={{ fontFamily: 'ui-serif,Georgia,Cambria,Times New Roman,Times,serif' }}
                tw="text-7xl text-gray-900">
              Loopie
            </h1>
            <p style={{ fontFamily: 'ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif' }}
              tw="font-sans text-3xl text-gray-600 text-center">
              calm web3 news for the early enthusiast
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
