# frozen_string_literal: true

json.extract!(site, :id, :name, :language)

if site.terms_pdf.attached?
  json.terms_pdf_filename site.terms_pdf.filename.to_s
  json.terms_pdf_url rails_blob_url(site.terms_pdf)
end
