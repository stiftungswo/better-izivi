require 'iban-tools'

class User < ApplicationRecord
  validates :first_name, :last_name, :email,
            :address, :bank_iban, :birthday,
            :city, :health_insurance,
            :zip, :hometown, :phone, presence: true

  validates :zdp, numericality: { greater_than: 25_000, less_than: 999_999, only_integer: true }
  validates :zip, numericality: { only_integer: true }
  validates :bank_iban, format: { with: /\ACH\d{2}(\w{4}){4,7}\w{0,2}\z/ }

  validate :validate_iban

  belongs_to :role
  belongs_to :regional_center

  private

  def validate_iban
    IBANTools::IBAN.new(bank_iban).validation_errors.each do |error|
      errors.add(:bank_iban, error)
    end
  end
end
