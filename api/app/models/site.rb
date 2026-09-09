# frozen_string_literal: true

class Site < ApplicationRecord
  enum :language, { german: 'de', french: 'fr' }, prefix: true

  has_one_attached :terms_pdf
  has_many :service_specifications, dependent: :restrict_with_error

  validates :name, :language, presence: true
  validate :validate_terms_pdf_attached
  validate :validate_terms_pdf_content_type

  private

  def validate_terms_pdf_attached
    errors.add(:terms_pdf, :blank) unless terms_pdf.attached?
  end

  def validate_terms_pdf_content_type
    return unless terms_pdf.attached?

    errors.add(:terms_pdf, :invalid_content_type) unless terms_pdf.content_type == 'application/pdf'
  end
end
