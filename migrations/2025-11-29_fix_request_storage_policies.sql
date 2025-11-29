-- Migration: Fix requests table and storage policies
-- Date: 2025-11-29
-- Amaç: 
--   1. customer_id NULL kabul etmeli (misafir kullanıcılar için)
--   2. Storage bucket RLS policy ekle

-- 1. requests.customer_id NULL olabilir hale getir
ALTER TABLE requests ALTER COLUMN customer_id DROP NOT NULL;

COMMENT ON COLUMN requests.customer_id IS 'Müşteri ID (NULL ise misafir kullanıcı)';

-- 2. Storage bucket için RLS politikaları
-- Not: Bu SQL'i çalıştırmadan önce Supabase Dashboard'da 
-- Storage > request-photos bucket'ını oluşturun (Public olarak)

-- Bucket için RLS etkinleştir (eğer manuel oluşturulmuşsa zaten açık olabilir)
-- Supabase Dashboard üzerinden yapıldıysa bu adım gerekli değil

-- INSERT policy: Herkes yükleyebilir (anonim dahil)
CREATE POLICY "Anyone can upload request photos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'request-photos');

-- SELECT policy: Herkes okuyabilir (public bucket)
CREATE POLICY "Anyone can view request photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'request-photos');

-- UPDATE policy: Yükleyen kullanıcı güncelleyebilir
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'request-photos' AND auth.uid()::text = owner);

-- DELETE policy: Yükleyen kullanıcı silebilir veya admin
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'request-photos' AND auth.uid()::text = owner);
