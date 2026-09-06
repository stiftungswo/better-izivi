# frozen_string_literal: true

class BackfillSitesAndServiceSpecificationSites < ActiveRecord::Migration[8.0]
  ZURICH_TERMS_PDF = Rails.root.join('app/assets/pdfs/german_service_agreement_text.pdf').freeze
  VALAIS_TERMS_PDF = Rails.root.join('app/assets/pdfs/french_service_agreement_text.pdf').freeze

  def up
    zurich_site = create_site('Zürich', 'german', ZURICH_TERMS_PDF, 'anstellungsbedingungen_zuerich.pdf')
    valais_site = create_site('Wallis', 'french', VALAIS_TERMS_PDF, 'conditions_engagement_valais.pdf')

    # rubocop:disable Rails/SkipsModelValidations -- one-time backfill of an already-validated FK
    ServiceSpecification.where(location: 'zh').update_all(site_id: zurich_site.id)
    ServiceSpecification.where(location: 'vs').update_all(site_id: valais_site.id)
    # rubocop:enable Rails/SkipsModelValidations
  end

  def down
    ServiceSpecification.update_all(site_id: nil) # rubocop:disable Rails/SkipsModelValidations
    Site.destroy_all
  end

  private

  def create_site(name, language, source_path, filename)
    site = Site.new(name:, language:)
    site.terms_pdf.attach(io: File.open(source_path), filename:, content_type: 'application/pdf')
    site.save!
    site
  end
end
