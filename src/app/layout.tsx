import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
// or `v1X-appRouter` if you are using Next.js v1X

export default function RootLayout(props: { children: any }) {
  const { children } = props;
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
