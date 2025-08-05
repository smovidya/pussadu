# Pussadu

## Todo คร่าวๆ

### ผู้ใช้

- ลิสต์ของที่ยืมอยู่ / รออนุมัติ
- เลือกโครงการ
- ลิสต์ของในโครงการ

### Admin

- ประวัติ / สถานะการยืม
- อนุมัติการยืม
- crud พัสดุ
- crud โครงการ

## Developing

Once you've created a project and installed dependencies with `bun install`, start a development server:

```sh
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

### Components development

To develop components, we use [Storybook](https://storybook.js.org/). You can start the Storybook server with:

```sh
bun run storybook
```

This will allow you to develop and test your components in isolation at `http://localhost:6006`.

## Building

To create a production version of your app:

```sh
bun run build
```

You can preview the production build with `bun run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
