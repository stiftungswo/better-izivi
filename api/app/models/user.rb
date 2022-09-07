# frozen_string_literal: true

require 'iban-tools'

class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::Allowlist

  belongs_to :regional_center

  has_many :expense_sheets, dependent: :restrict_with_error
  has_many :services, dependent: :restrict_with_error

  enum role: {
    admin: 1,
    civil_servant: 2
  }

  devise :database_authenticatable, :registerable,
         :recoverable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  validates :first_name, :last_name, :email,
            :address, :bank_iban, :birthday,
            :city, :health_insurance, :role,
            :zip, :hometown, :phone, presence: true, unless: :only_password_changed?
  validates :email, :zdp, uniqueness: { case_sensitive: false }

  validates :zdp, numericality: {
    greater_than: 10_000,
    less_than: 999_999,
    only_integer: true
  }, unless: :only_password_changed?

  validates :zip, numericality: { only_integer: true }, unless: :only_password_changed?
  validates :bank_iban, format: { with: /\ACH\d{2}(\w{4}){4,7}\w{0,2}\z/ }, unless: :only_password_changed?
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, unless: :only_password_changed?

  validate :validate_iban, unless: :only_password_changed?

  def self.validate_given_params(user_params)
    errors = User.new(user_params).tap(&:validate).errors
    given_keys = user_params.keys.map(&:to_sym)

    errors.dup.each do |error|
      errors.delete error.attribute unless error.attribute.in?(given_keys)
    end

    errors
  end

  def self.strip_iban(bank_iban)
    bank_iban.gsub(/\s+/, '')
  end

  def prettified_bank_iban
    IBANTools::IBAN.new(bank_iban).prettify
  end

  def full_name
    "#{first_name} #{last_name}"
  end

  def zip_with_city
    "#{zip} #{city}"
  end

  def jwt_payload
    { isAdmin: admin? }
  end

  def active?
    active_service.present?
  end

  def active_service
    services.find { |service| Time.zone.today.in? service.date_range }
  end

  def next_service
    services.select(&:in_future?).min_by(&:beginning)
  end

  def validate_iban
    IBANTools::IBAN.new(bank_iban).validation_errors.each do |error|
      errors.add(:bank_iban, error)
    end
  end

  def only_password_changed?
    return false unless encrypted_password_changed?

    changes.keys.length == 1
  end
end
