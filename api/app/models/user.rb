# frozen_string_literal: true

require 'iban-tools'

class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::Whitelist

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
  validates :legacy_password, presence: true, if: -> { encrypted_password.blank? }

  validate :validate_iban, unless: :only_password_changed?
  validate :make_user_dime, on: :create

  def self.validate_given_params(user_params)
    errors = User.new(user_params).tap(&:validate).errors

    errors.each do |attribute, _error|
      errors.delete attribute unless attribute.to_s.in?(user_params.keys.map(&:to_s))
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

  def reset_password(*args)
    reset_legacy_password
    super
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

  def only_password_changed?
    return false unless encrypted_password_changed?

    changes.keys.length == 1 || (legacy_password_changed? && changes.keys.length == 2)
  end

  def validate_iban
    IBANTools::IBAN.new(bank_iban).validation_errors.each do |error|
      errors.add(:bank_iban, error)
    end
  end

  def make_user_dime
    token = AuthenticateInDime.log_in
    body = { "email": email, "can_login": false, "first_name": first_name,
             "last_name": last_name, "password": password, "employee_group_id": 1,
             "password_repeat": password }.to_json
    uri = URI('https://dime-apir.stiftungswo.ch/v2/employees')
    req = Net::HTTP::Post.new(uri, 'Authorization' => token, 'Content-Type' => 'application/json')
    http = Net::HTTP.new(uri.host, uri.port)
    http.verify_mode = OpenSSL::SSL::VERIFY_PEER
    req.body = body
    http.request(req)
  end
end
