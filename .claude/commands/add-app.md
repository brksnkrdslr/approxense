---
description: Approxense'e yeni bir mini-uygulamayı /apps/<slug> altında barındırılacak şekilde ekler
---

Bu komut, elimizde hazır duran bağımsız (vanilla HTML/CSS/JS, kendi `<html>` yapısına sahip, tek dosyalık veya birkaç statik dosyadan oluşan) bir mini-uygulamayı bu repoya (approxense) ekleyip `/apps/<slug>` adresinde canlıya almak için kullanılır.

Argüman olarak şunları bekle (kullanıcı vermediyse sor):
1. **Kaynak klasör/dosya yolu** — eklenecek mini-uygulamanın `index.html` (+ varsa ikon, manifest gibi statik dosyaları) nerede duruyor.
2. **slug** — URL'de kullanılacak kısa isim (örn. `kiril`). Küçük harf, tire dışında özel karakter yok, mevcut route'larla (`game`, `play`, `room`, `result`, `api`) çakışmamalı.
3. **Görünen isim ve kısa açıklama** — kayıt defteri için.

## Mimari (zaten kurulu, değiştirme)

- `src/app/apps/[slug]/route.ts` — TEK ve GENEL route handler. `public/apps/<slug>/index.html` var mı diye bakar, varsa olduğu gibi (ham HTML, kök layout'un telefon çerçevesi sarmalaması OLMADAN) döndürür. **Yeni bir mini-uygulama eklemek için bu dosyaya dokunmana gerek yok.**
- `src/lib/miniapps.ts` — hangi mini-uygulamaların barındırıldığının kaydı (ileride bir uygulama menüsü/landing page yapılırsa buradan üretilecek).
- `public/apps/<slug>/` — her mini-uygulamanın kendi kendine yeten (self-contained) statik dosyaları.

## Yapılacaklar (sırayla)

1. **Kopyala**: kaynak dosyaları `public/apps/<slug>/` altına kopyala (yoksa klasörü oluştur).
2. **Yolları düzelt**: kopyalanan `index.html` (ve varsa `manifest.json`) içindeki ikon/manifest/favicon gibi kök-göreli (`/...`) referansları `/apps/<slug>/...` önekiyle güncelle. Bu, ilerde bu uygulamayı kendi domainine taşırken tek yapılacak şeyin bu öneki silmek olmasını sağlıyor — dosyaları başka bir şekilde değiştirme, mimariyi bozma.
   - Eğer kaynak dosyalar zaten SADECE göreli yol kullanıyorsa (örn. `icon.png`, `href="icon.png"`, başında `/` yok), önce bunları da `/apps/<slug>/icon.png` gibi mutlak hale getir — aksi halde `/apps/<slug>` (sondaki `/` olmadan) adresinde tarayıcı bunları yanlış çözer.
3. **Kayıt defterine ekle**: `src/lib/miniapps.ts` içindeki `miniApps` dizisine `{ slug, name, description, addedAt: <bugünün tarihi YYYY-MM-DD> }` ekle.
4. **Doğrula**:
   - `npm run build` — hatasız geçmeli, route listesinde `/apps/[slug]` zaten var olmalı (yeni route eklenmemeli).
   - `npm run lint` — yeni dosyalarda hata olmamalı (repodaki eski/ilgisiz uyarılara takılma).
   - `npm run dev -- -p <boş bir port>` başlatıp `curl` ile:
     - `GET /apps/<slug>` → 200, doğru `<title>` içeriyor
     - varsa statik alt dosyalar (`/apps/<slug>/icon.png` vb.) → 200
     - `GET /` (ana sayfa) → hâlâ 200 (regresyon yok)
   - Test bitince dev server'ı durdur.
5. **Git**: `feature/add-<slug>` branch'i aç, sadece ilgili yeni/değişen dosyaları stage'le, açıklayıcı bir commit mesajıyla commit et, push'la.
6. **PR**: `gh pr create` ile PR aç (base: `master`). PR açıklamasına ne eklendiğini ve doğrulama adımlarının sonucunu yaz.
7. **Merge/deploy**: Kullanıcıya PR linkini ver, merge edip etmeyeceğini/ne zaman production'a deploy etmek istediğini sor — otomatik merge etme. Kullanıcı onaylarsa:
   - PR'ı merge et, VE
   - GitHub→Vercel otomatik deploy'unun production'a düşüp düşmediğini kontrol et (`gh api repos/brksnkrdslr/approxense/deployments` ile son deploy'un `environment`'ının `Production` olduğuna bak). Düşmüyorsa (bilinen bir sorun, GitHub entegrasyonu Production Branch ayarını bazen kaçırıyor), `vercel --prod --yes` ile doğrudan production'a deploy et ve `https://www.approxense.com/apps/<slug>` üzerinde `curl` ile doğrula.

## Önemli kısıtlar

- Mevcut route'ları (`/`, `/game`, `/play`, `/room`, `/api/*`) etkileyecek hiçbir değişiklik yapma.
- Her mini-uygulama tamamen izole kalmalı: Approxense'in Supabase/React altyapısına bağımlı olmamalı (dışarıdan bağımsız statik bir HTML/CSS/JS olmalı ki hem bu domainde hem ileride kendi domaininde sorunsuz çalışsın).
- `.claude/commands/add-app.md` dosyasının kendisini (bu dosyayı) değiştirme — sadece uygulama ekleme işini yap.
