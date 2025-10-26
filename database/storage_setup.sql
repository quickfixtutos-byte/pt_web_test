-- Supabase Storage Setup for Receipt Uploads
-- Run this in your Supabase SQL Editor

-- Create receipts storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false, -- Private bucket for security
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
);

-- Create RLS policies for receipts bucket
CREATE POLICY "Users can upload their own receipts" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'receipts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own receipts" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'receipts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all receipts" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'receipts' 
    AND EXISTS (
      SELECT 1 FROM students 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

CREATE POLICY "Users can update their own receipts" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'receipts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own receipts" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'receipts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to automatically organize receipts by user
CREATE OR REPLACE FUNCTION organize_receipt_by_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract user_id from the payment record
  NEW.name = 'receipts/' || NEW.name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic file organization
CREATE TRIGGER organize_receipt_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'receipts')
  EXECUTE FUNCTION organize_receipt_by_user();
