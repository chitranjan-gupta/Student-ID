// These styles apply to every route in the application
import "./globals.css";
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-white">
      <head>
        <meta charSet="utf-8" />
        <title>Student ID</title>
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
