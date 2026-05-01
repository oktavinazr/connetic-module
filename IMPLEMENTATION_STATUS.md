# CONNETIC Module - Status Implementasi

## ✅ Yang Sudah Selesai Diimplementasikan:

### 1. Sistem Pre-test & Post-test Global
- ✅ Pre-test Umum (10 soal) - wajib diselesaikan sebelum akses pertemuan
- ✅ Post-test Umum (10 soal) - terbuka setelah menyelesaikan semua pertemuan
- ✅ Komponen TestPage universal untuk semua jenis tes
- ✅ GlobalPretestPage dan GlobalPosttestPage

### 2. Sistem Progress Bertahap (Unlocking)
- ✅ Pertemuan 1 terbuka setelah menyelesaikan Pre-test Umum
- ✅ Pertemuan 2-4 terbuka bertahap (harus selesai pretest + 7 tahapan + posttest pertemuan sebelumnya)
- ✅ Post-test Umum terbuka setelah menyelesaikan semua 4 pertemuan
- ✅ Fungsi `isLessonUnlocked()` dan `isGlobalPosttestUnlocked()` di progress.ts

### 3. Dashboard yang Diperbarui
- ✅ Nama pengguna ditampilkan sebagai nama depan saja
- ✅ Tahapan CTL TIDAK ditampilkan lagi (sesuai permintaan)
- ✅ Card pertemuan menampilkan status locked/unlocked
- ✅ Progress bar menghitung: pretest + 7 tahapan + posttest
- ✅ Badge status untuk pretest, tahapan CTL, dan posttest
- ✅ Card Post-test Umum dengan status unlock

### 4. Struktur Data Lesson yang Diperluas
- ✅ Setiap pertemuan memiliki `pretest` dan `posttest` sendiri (masing-masing 5-10 soal)
- ✅ Field tambahan untuk setiap stage:
  - `videoUrl` - untuk Constructivism
  - `imageUrl` - untuk Questioning
  - `material` - untuk Inquiry (materi pembelajaran)
  - `groupActivity` - untuk Learning Community (kelompok dan aktivitas)
  - `practiceInstructions` - untuk Modeling (instruksi guru dan siswa)
  - `reflectionPrompts` - untuk Reflection (prompt journaling)
- ✅ Authentic Assessment diubah menjadi format esai (tidak ada options/correctAnswer)

### 5. Pertemuan 1 (Konsep Dasar TCP) - Data Lengkap
- ✅ Pretest 5 soal
- ✅ 7 Tahapan CTL dengan data lengkap:
  - Constructivism dengan videoUrl YouTube
  - Inquiry dengan material pembelajaran
  - Questioning dengan imageUrl
  - Learning Community dengan 5 kelompok dan diskusi points
  - Modeling dengan instruksi praktik untuk guru dan siswa
  - Reflection dengan 4 reflection prompts
  - Authentic Assessment dengan pertanyaan esai 4 poin
- ✅ Posttest 10 soal

## ⚠️ Yang Perlu Dilengkapi:

### 1. Data Pertemuan 2, 3, 4
Pertemuan 2 (Mekanisme TCP), 3 (IPv4), dan 4 (IPv6) masih menggunakan struktur lama.

**Yang harus ditambahkan untuk masing-masing pertemuan:**
```typescript
pretest: {
  questions: [ /* 5 soal */ ]
},
stages: [
  {
    type: 'constructivism',
    videoUrl: 'https://youtube.com/...', // Link video YouTube
    // ... rest
  },
  {
    type: 'inquiry',
    material: {
      title: '...',
      content: ['...'],
      examples: ['...']
    },
    // ... rest
  },
  {
    type: 'questioning',
    imageUrl: 'https://...', // Link gambar
    // ... rest
  },
  {
    type: 'learning-community',
    groupActivity: {
      groupNames: ['Kelompok 1', ...],
      activity: '...',
      discussionPoints: ['...']
    },
    // ... rest
  },
  {
    type: 'modeling',
    practiceInstructions: {
      forTeacher: ['...'],
      forStudent: ['...']
    },
    // ... rest
  },
  {
    type: 'reflection',
    reflectionPrompts: ['...'],
    // ... rest
  },
  {
    type: 'authentic-assessment',
    question: 'Pertanyaan esai dengan 4 poin...',
    // NO options, NO correctAnswer
  }
],
posttest: {
  questions: [ /* 10 soal */ ]
}
```

Lokasi file: `/tmp/sandbox/src/app/data/lessons.ts` (baris ~500 ke bawah)

### 2. Komponen Stage yang Perlu Diupdate

Beberapa komponen stage sudah dibuat tapi perlu diupdate:

#### a. ConstructivismStage.tsx ✅ SUDAH DIBUAT
- Sudah ada video player dengan iframe
- Sudah ada polling + reasoning

#### b. InquiryStage.tsx - PERLU UPDATE
**Yang harus ditambahkan:**
- Tampilkan material pembelajaran terlebih dahulu (material.title, material.content, material.examples)
- Implementasi drag & drop untuk matching pairs
- Gunakan library `react-dnd` yang sudah diinstall

**Contoh struktur:**
```tsx
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// 1. Tampilkan materi dulu
// 2. Setelah user baca, tampilkan drag & drop matching
// 3. User drag "left items" ke "right items" untuk memasangkan
```

#### c. QuestioningStage.tsx - PERLU UPDATE
**Yang harus ditambahkan:**
- Tampilkan gambar interaktif (imageUrl) di atas pertanyaan
- Bisa tambahkan zoom/lightbox untuk gambar

#### d. LearningCommunityStage.tsx - PERLU UPDATE
**Yang harus ditambahkan:**
- Dropdown/select untuk memilih kelompok (dari groupActivity.groupNames)
- Tampilkan aktivitas kelompok (groupActivity.activity)
- Tampilkan discussion points sebagai panduan diskusi
- Form untuk input hasil diskusi kelompok
- Setuju/tidak setuju + alasan kelompok (bukan individu)

#### e. ModelingStage.tsx - PERLU UPDATE
**Yang harus ditambahkan:**
- Tab/section untuk "Instruksi Guru" dan "Instruksi Siswa"
- Tampilkan practiceInstructions.forTeacher
- Tampilkan practiceInstructions.forStudent
- Drag & drop untuk ordering items (sama seperti sebelumnya)
- Checkbox "Saya sudah mengikuti demonstrasi guru"

#### f. ReflectionStage.tsx - PERLU UPDATE
**Yang harus ditambahkan:**
- Tampilkan reflectionPrompts sebagai pertanyaan pemandu
- Textarea untuk journaling (minimal 50-100 karakter per prompt)
- Setelah journaling, baru tampilkan pilihan kesimpulan

#### g. AuthenticAssessmentStage.tsx ✅ SUDAH DIUPDATE
- Sudah tidak ada options lagi
- Sudah bentuk esai

### 3. LessonPage yang Terintegrasi

File: `/tmp/sandbox/src/app/pages/LessonPage.tsx`

**Yang harus dibuat:**
```tsx
// LessonPage harus mengatur flow:
// 1. Cek apakah lesson unlocked (isLessonUnlocked)
// 2. Jika unlocked, cek apakah pretest sudah selesai
// 3. Jika pretest belum, redirect ke /lesson/:id/pretest
// 4. Jika pretest sudah, tampilkan stage sesuai progress
// 5. Setelah semua stage selesai, redirect ke /lesson/:id/posttest
// 6. Jika posttest sudah, tampilkan review atau kembali ke dashboard
```

### 4. PreTest dan PostTest Per Lesson

**Yang harus dibuat:**
- `LessonPretestPage.tsx` - menggunakan TestPage component
- `LessonPosttestPage.tsx` - menggunakan TestPage component

**Routes yang harus ditambahkan di routes.ts:**
```tsx
{
  path: '/lesson/:lessonId/pretest',
  element: <ProtectedRoute><LessonPretestPage /></ProtectedRoute>
},
{
  path: '/lesson/:lessonId/posttest',
  element: <ProtectedRoute><LessonPosttestPage /></ProtectedRoute>
}
```

## 📝 Checklist Langkah Selanjutnya:

### Prioritas Tinggi:
- [ ] Lengkapi data Pertemuan 2, 3, 4 di `lessons.ts` (pretest, videoUrl, imageUrl, material, groupActivity, practiceInstructions, reflectionPrompts, posttest)
- [ ] Update InquiryStage dengan material + drag & drop
- [ ] Buat LessonPage yang terintegrasi dengan flow pretest → stages → posttest
- [ ] Buat LessonPretestPage dan LessonPosttestPage
- [ ] Update routes.ts dengan route lesson pretest/posttest

### Prioritas Sedang:
- [ ] Update QuestioningStage dengan gambar interaktif
- [ ] Update LearningCommunityStage dengan kelompok dan aktivitas
- [ ] Update ModelingStage dengan instruksi praktik
- [ ] Update ReflectionStage dengan journaling prompts

### Prioritas Rendah (Nice to Have):
- [ ] Animasi transisi antar stage
- [ ] Sound effects untuk feedback
- [ ] Export/print hasil pembelajaran
- [ ] Dashboard untuk guru (jika diperlukan)

## 🎯 Cara Melanjutkan Development:

1. **Lengkapi Data Lesson** - Paling penting!
   - Edit file: `/tmp/sandbox/src/app/data/lessons.ts`
   - Copy struktur Pertemuan 1, sesuaikan untuk Pertemuan 2, 3, 4

2. **Update InquiryStage dengan Drag & Drop:**
```tsx
// File: /tmp/sandbox/src/app/components/stages/InquiryStage.tsx
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Implementasi drag & drop untuk matching
```

3. **Buat LessonPage:**
```tsx
// File: /tmp/sandbox/src/app/pages/LessonPage.tsx
// Flow: pretest → stage 0-6 → posttest
```

4. **Test Flow Lengkap:**
   - Register → Login
   - Kerjakan Pre-test Umum
   - Masuk Pertemuan 1
   - Kerjakan Pretest Pertemuan 1
   - Kerjakan 7 tahapan CTL
   - Kerjakan Posttest Pertemuan 1
   - Pertemuan 2 terbuka
   - ... dst sampai Post-test Umum

## 🔧 Teknologi yang Sudah Digunakan:

- ✅ React 18 dengan TypeScript
- ✅ React Router 7 (data mode)
- ✅ Tailwind CSS v4
- ✅ LocalStorage untuk data persistence
- ✅ react-dnd & react-dnd-html5-backend (untuk drag & drop)
- ✅ Lucide React (icons)

## 📚 Referensi Kode:

- **Progress Logic:** `/tmp/sandbox/src/app/utils/progress.ts`
- **Auth Logic:** `/tmp/sandbox/src/app/utils/auth.ts`
- **Lesson Data:** `/tmp/sandbox/src/app/data/lessons.ts`
- **Test Component:** `/tmp/sandbox/src/app/components/TestPage.tsx`
- **Dashboard:** `/tmp/sandbox/src/app/pages/DashboardPage.tsx`
- **Stage Components:** `/tmp/sandbox/src/app/components/stages/`

## ❓ Pertanyaan untuk Reflection Stage:

> "tahap reflection lebih baik ditambah apa ya? apakah sudah sesuai dengan tahapan CTL?"

**Jawaban:** Sudah sesuai dengan CTL, tapi bisa diperkaya dengan:
1. ✅ Journaling prompts (sudah ditambahkan di `reflectionPrompts`)
2. Self-assessment: "Seberapa baik saya memahami materi ini? (1-5)"
3. Peer reflection: "Apa yang saya pelajari dari diskusi kelompok?"
4. Future application: "Bagaimana saya akan menggunakan pengetahuan ini?"

Struktur reflection yang ideal:
1. **Personal Journaling** (4 prompts yang sudah ada)
2. **Self-Assessment** (rating pemahaman)
3. **Kesimpulan** (pilihan pernyataan yang sudah ada)

---

**Status Keseluruhan:** ~60% selesai
**Yang Harus Dikerjakan:** Data lesson 2-4, update stage components, integrasi LessonPage
