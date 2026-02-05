# Blog Projesi

Bu proje, Node.js ve MySQL kullanılarak geliştirilmiş dinamik bir blog uygulamasıdır. Kullanıcılar ve yöneticiler için ayrı arayüzler sunar.

siteyi canlıda görmek isterseniz linke tıklayrak gidebilirsiniz. https://blog1-f397.onrender.com/user/index.html

bu bir ücretsiz servistir bu yüzden bazı durumlarda çalışmayabilir veya deactive olmuş olabilir.

## Özellikler

- **Yönetici Paneli:** Yazı ekleme, düzenleme, silme ve kategori yönetimi.
- **Kullanıcı Arayüzü:** Blog yazılarını listeleme, detay görüntüleme ve kategoriye göre filtreleme.
- **Resim Yükleme:** Yazılar için kapak fotoğrafı yükleme desteği.
- **Yorum Sistemi:** Kullanıcıların yazılara yorum yapabilmesi.

## Teknolojiler

- **Backend:** Node.js, Express.js
- **Veritabanı:** MySQL
- **Frontend:** HTML, CSS, JavaScript (Vanilla)

## Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Gereksinimler:**
    - Node.js
    - MySQL Veritabanı

2.  **Projeyi Klonlayın veya İndirin:**
    Dosyaları bilgisayarınıza indirin.

3.  **Bağımlılıkları Yükleyin:**
    Terminali açın ve proje dizininde şu komutu çalıştırın:
    ```bash
    npm install
    ```
    Bu komut `backend` klasörü içinde çalıştırılmalıdır.

4.  **Veritabanı Ayarları:**
    - MySQL'de yeni bir veritabanı oluşturun.
    - `backend/.env` dosyasını (yoksa `.env.example`'dan kopyalayıp oluşturun) kendi veritabanı bilgilerinize göre düzenleyin.
    - Gerekli tabloları oluşturmak için SQL dosyasını içeri aktarın veya uygulamanın otomatik oluşturmasını bekleyin (backend mantığına bağlı olarak).

5.  **Uygulamayı Başlatın:**
    `backend` klasörü içerisindeyken:
    ```bash
    npm start
    ```
    veya
    ```bash
    node server.js
    ```

6.  **Tarayıcıda Açın:**
    Genellikle `http://localhost:3000` (veya sunucu portu ne ise) adresine gidin.

## Proje Yapısı

- `admin/`: Yönetici paneli sayfaları.
- `assets/`: İkonlar, resimler ve JavaScript dosyaları.
- `backend/`: Sunucu taraflı kodlar, API rotaları ve veritabanı bağlantısı.
- `components/`: Tekrar kullanılabilir HTML parçaları (header, footer).
- `styles/`: CSS dosyaları.
- `user/`: Son kullanıcı sayfaları.
