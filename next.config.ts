import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const config: NextConfig = {
  allowedDevOrigins: ['192.168.15.10'],
  poweredByHeader: false,
  trailingSlash: true,
  compress: true,
  images:{unoptimized:true,remotePatterns:[{protocol:'https',hostname:'images.unsplash.com'}]},
  async headers(){
    return [{
      source:'/:path*',
      headers:[
        {key:'X-Frame-Options',value:'DENY'},
        {key:'X-Content-Type-Options',value:'nosniff'},
        {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
        {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
        {key:'Content-Security-Policy',value:"frame-ancestors 'none'; base-uri 'self'; form-action 'self'"},
      ],
    }]
  },
  experimental: {
    useTypeScriptCli: false,
  },
}

const withNextIntl=createNextIntlPlugin('./i18n/request.ts')

export default withNextIntl(config)
