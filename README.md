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

# backend

## public facing

~~- list my project~~
~~- list my borrowing~~

## admin

- approve

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

#### Create a new component

To create a new component, run the following command:

```sh
bun storybook:new <ComponentName>
```

This will create a new component in the `src/stories` directory with the necessary files and boilerplate code.

### Add a new sub component

Sometime you may want to add a sub component to an existing component. Dialog header is a good example of this. To add a sub component, run the following command:

```sh
bun storybook:add
```

After follow the prompt, it will create a new sub component in the `src/stories/<ComponentName>` directory with the necessary files and boilerplate code.

## Building

To create a production version of your app:

```sh
bun run build
```

You can preview the production build with `bun run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
