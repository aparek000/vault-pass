# 🛡️ VaultPass — Secure Password Manager

Aplikasi pengelola password modern, clean, dan aman dengan **Zero-Knowledge Client-Side AES-256-GCM**, autentikasi biometrik (**Face ID / Touch ID / WebAuthn**), dan integrasi **Supabase PostgreSQL Row Level Security (RLS)**.

---

## 🚀 Panduan Publish ke GitHub & Netlify

Aplikasi ini siap di-deploy secara instan ke **GitHub** dan **Netlify** dalam beberapa langkah mudah.

---

### Langkah 1: Push Project ke GitHub

1. Buka terminal di folder project ini.
2. Inisialisasi git dan buat commit:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit VaultPass secure password manager"
   ```
3. Buat repository baru di [GitHub](https://github.com/new) (contoh: `vaultpass`).
4. Sambungkan ke remote repository dan push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/USERNAME_KAMU/vaultpass.git
   git push -u origin main
   ```

---

### Langkah 2: Deploy ke Netlify

#### Cara A: Otomatis via GitHub (Rekomendasi - Continuous Deployment)
1. Buka [app.netlify.com](https://app.netlify.com/) dan login menggunakan akun GitHub kamu.
2. Klik tombol **"Add new site"** > **"Import an existing project"**.
3. Pilih penyedia **GitHub**, lalu pilih repository `vaultpass` yang baru saja kamu push.
4. Netlify akan secara otomatis mendeteksi pengaturan build dari file `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. *(Opsional namun disarankan)* Pada menu **Environment variables**, tambahkan:
   - `VITE_SUPABASE_URL`: URL project Supabase kamu (contoh: `https://xyz.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Kunci anonim publik Supabase kamu
6. Klik **"Deploy VaultPass"**. Dalam ~45 detik, website kamu sudah live dengan HTTPS gratis!

#### Cara B: Menggunakan Netlify CLI
1. Install Netlify CLI jika belum ada:
   ```bash
   npm install -g netlify-cli
   ```
2. Build project terlebih dahulu:
   ```bash
   npm run build
   ```
3. Deploy ke production:
   ```bash
   netlify deploy --prod --dir=dist
   ```

#### Cara C: Netlify Drag & Drop
1. Jalankan `npm run build` di terminal kamu untuk menghasilkan folder `dist/`.
2. Buka [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag dan drop folder `dist/` ke area yang tersedia. Website kamu akan langsung online!

---

## 🗄️ Konfigurasi Supabase PostgreSQL & RLS

1. Buka dashboard [Supabase](https://app.supabase.com) dan buat project baru.
2. Masuk ke menu **SQL Editor**.
3. Buka file `supabase_schema.sql` di repository ini, salin seluruh kodenya, dan jalankan (**Run**).
4. Skema ini otomatis membuat:
   - Tabel `public.profiles` dengan trigger otomatis saat registrasi pengguna.
   - Tabel `public.password_entries` dengan enkripsi ciphertext.
   - **Row Level Security (RLS)** ketat sehingga User A tidak dapat membaca atau memodifikasi data milik User B.

---

## 🔐 Fitur Keamanan VaultPass

- **Zero-Knowledge Architecture**: Master password pengguna tidak pernah dikirim atau disimpan di server.
- **Client-Side AES-256-GCM**: Setiap password dienkripsi di browser sebelum dikirim ke database dengan salt 16-byte unik dan IV 12-byte CSPRNG.
- **Biometric Authentication**: Mendukung Apple Face ID, Touch ID, dan WebAuthn Passkeys.
- **Auto-Lock Timeout**: Mengunci vault otomatis saat jendela tidak aktif atau ditinggalkan.
- **Clipboard Auto-Clear**: Menghapus password yang disalin dari clipboard setelah 30 detik untuk mencegah pencurian data.
- **Strong Password Generator**: Menghasilkan password ber-entropi tinggi dengan kombinasi simbol, angka, huruf besar, dan huruf kecil.

---

## 🛠️ Pengembangan Lokal

```bash
# 1. Install dependencies
npm install

# 2. Jalankan dev server
npm run dev

# 3. Validasi tipe TypeScript
npm run lint

# 4. Build untuk production
npm run build
```
