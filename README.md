# 📰 Berita

**Berita** adalah platform publikasi berita dan blog modern yang memiliki fitur lengkap. Dibangun menggunakan **Next.js 16**, **React 19**, dan **Prisma ORM**, aplikasi ini menyediakan ekosistem terpadu untuk membaca, menulis, mengkategorikan, serta berinteraksi dengan berbagai artikel berita.

## ✨ Fitur Utama

- **Autentikasi & Otorisasi**: Sistem keamanan dan autentikasi pengguna dengan kontrol akses berbasis Peran (*Role-based*: User/Admin) menggunakan JWT (`jose`) dan `bcryptjs`.
- **Manajemen Artikel**: Buat, edit, dan publikasikan artikel *rich-text* yang dilengkapi dengan gambar fitur, kategori, dan tag. Mendukung berbagai status publikasi seperti *Draft*, *Published*, dan *Archived*.
- **Interaksi Pengguna**: 
  - Berikan *Like* dan simpan (*Bookmark*) artikel favorit Anda.
  - Sistem komentar interaktif yang mendukung balasan bertingkat (*nested replies*).
  - Berikan *Like* pada komentar pengguna lain.
- **Sistem Notifikasi**: Pemberitahuan secara *real-time* untuk setiap interaksi, seperti balasan langsung pada komentar Anda atau saat komentar Anda disukai.
- **Desain UI Modern**: Tampilan responsif dan elegan yang dirancang menggunakan **Tailwind CSS v4** terbaru serta koleksi ikon dari `lucide-react`.

## 🛠️ Tech Stack (Teknologi yang Digunakan)

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Bahasa Pemrograman**: TypeScript
- **Database**: PostgreSQL
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ikon**: [Lucide React](https://lucide.dev/)

## 🚀 Panduan Memulai (*Getting Started*)

### Prasyarat Instalasi

Pastikan Anda telah menginstal perangkat lunak berikut di komputer lokal Anda:
- [Node.js](https://nodejs.org/) (Direkomendasikan versi 18 atau lebih baru)
- npm, yarn, pnpm, atau bun
- Database PostgreSQL

### Langkah Instalasi

1. **Kloning Repositori:**
   ```bash
   git clone https://github.com/ramsaairil/berita.git
   cd berita
   ```

2. **Instal Dependensi:**
   ```bash
   npm install
   ```

3. **Atur Environment Variables (`.env`):**
   Buat file bernama `.env` di folder utama (root) proyek dan konfigurasikan URL koneksi database PostgreSQL Anda serta JWT secret. Pastikan file ini tersimpan dengan aman.
   ```env
   # Contoh isi file .env
   DATABASE_URL="postgresql://user:password@localhost:5432/berita_db?schema=public"
   JWT_SECRET="kunci-rahasia-jwt-anda"
   ```

4. **Inisialisasi Skema Database (Migrasi):**
   Jalankan perintah migrasi Prisma untuk menyinkronkan struktur skema ke dalam database Anda.
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```

6. **Buka Aplikasi:**
   Kunjungi [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat dan menjelajahi fitur-fitur aplikasi.

## 🗄️ Arsitektur Database

Lapisan data proyek ini mengandalkan Prisma ORM untuk menjamin *type safety*, dan dirancang ke dalam beberapa relasi yang solid:
- **User**: Mengelola data pengguna, keamanan sandi, akses, dan pengaturan Peran (*Role*).
- **Article**: Model konten utama yang mencakup pencatatan jumlah tayangan (*views*), status publikasi, keterangan artikel, lengkap dengan pembuatnya.
- **Category & Tag**: Berfungsi mengklasifikasikan artikel agar setiap pembaca lebih mudah memilah konten berdasarkan topik spesifik.
- **Comment**: Mendukung kemampuan relasi rekursif atau balasan bertingkat pada setiap bagian komentar di artikel.
- **Bookmark & Like**: Relasi yang menghubungkan setiap akun pengguna ke Artikel dan Komentar yang mereka sukai.
- **Notification**: Melacak serta mendistribusikan peringatan / notifikasi secara otomatis supaya akun terus *up-to-date* terhadap percakapan mereka di dalam platform.

## 📄 Daftar Perintah (*Script Commands*)

- `npm run dev` - Menjalankan server Next.js pada mode pengembangan (*development*).
- `npm run build` - Melakukan kompilasi (*build*) aplikasi Node / Next.js agar siap diluncurkan di tahap produksi (*production*).
- `npm run start` - Menjalankan server aplikasi di mode operasi *production* hasil kompilasi.
- `npm run lint` - Menganalisis penulisan kode (*linting*) memakai standar ESLint guna mendeteksi *bugs* dan mematuhi best practices kode bersih.

## 🤝 Kontribusi

Saran, penemuan bug (*issues*), dan permintaan penambahan fitur sangat kami apresiasi! 
Silakan kunjungi [halaman issues](https://github.com/ramsaairil/berita/issues) jika Anda merasa menemukan kendala atau ingin sekadar berpartisipasi dengan *pull request*.

## 📝 Lisensi

Proyek ini telah dilisensikan menggunakan ketentuan Lisensi MIT.
