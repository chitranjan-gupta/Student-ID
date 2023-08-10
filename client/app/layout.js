export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <title>Student ID</title>
        </head>
        <body>{children}</body>
      </html>
    )
  }