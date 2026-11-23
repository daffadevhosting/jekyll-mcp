# Jekyll Component MCP

VS Code extension yang menghubungkan GitHub Copilot dengan MCP server
[`jekyll-component-mcp`](https://www.npmjs.com/package/jekyll-component-mcp/v/1.5.0).
Extension menjalankan server versi `1.5.0` untuk workspace Jekyll yang sedang
dibuka dan mendaftarkan tools server ke VS Code Language Model API.

[Repo GitHub](https://github.com/daffadevhosting/jekyll-mcp) ·
[Install dari VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=DaffaDev.jekyll-mcp) ·
[MCP server v1.5.0 di npm](https://www.npmjs.com/package/jekyll-component-mcp/v/1.5.0)

## Prasyarat

- VS Code `1.93.0` atau lebih baru
- Node.js 20 atau lebih baru, tersedia sebagai perintah `node` dan `npx`
- Folder workspace berisi situs Jekyll yang ingin dikerjakan

Extension menggunakan `npx` untuk menjalankan `jekyll-component-mcp@1.5.0`.
Pada penggunaan pertama, npm dapat mengunduh paket tersebut.

## Penggunaan

1. Buka folder situs Jekyll di VS Code.
2. Tunggu extension aktif. Status `Jekyll MCP: Active` muncul di status bar ketika server berhasil tersambung.
3. Gunakan tools `jekyll_*` yang tersedia melalui Copilot untuk mengerjakan situs.
4. Klik status bar atau jalankan **Jekyll MCP: Show Logs** dari Command Palette untuk melihat log.
5. Jalankan **Jekyll MCP: Restart Server** setelah ingin memulai ulang koneksi MCP.

Server menerima folder workspace pertama sebagai root situs. Jika tidak ada
workspace terbuka, server tidak dijalankan. Jika status menunjukkan gagal,
periksa output **Jekyll MCP** dan pastikan `node`/`npx` dapat dijalankan dari
lingkungan VS Code.

## Pengembangan

```sh
npm install
npm run compile
```

`npm run watch` menjalankan TypeScript compiler dalam mode watch. Hasil
kompilasi dibuat di `out/`, yang merupakan entrypoint extension. Repository ini
belum menyediakan test runner atau skrip lint.
