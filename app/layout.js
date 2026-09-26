import "./globals.css";

export const metadata = {
  title: "Royal Cement Frames",
  description: "Add a campaign frame to your photo and share it.",
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#161616" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
