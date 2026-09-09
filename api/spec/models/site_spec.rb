# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Site, type: :model do
  subject(:site) { build :site }

  it { is_expected.to be_valid }

  it 'is invalid without a name' do
    site.name = nil

    expect(site).not_to be_valid
  end

  it 'is invalid without a language' do
    site.language = nil

    expect(site).not_to be_valid
  end

  it 'is invalid without a terms pdf attached' do
    site.terms_pdf = nil

    expect(site).not_to be_valid
  end

  it 'is invalid when the terms pdf is not a PDF' do
    site.terms_pdf.attach(
      io: StringIO.new('not a pdf'), filename: 'not_a_pdf.txt', content_type: 'text/plain'
    )

    expect(site).not_to be_valid
  end

  it 'has many service specifications' do
    saved_site = create :site
    service_specification = create :service_specification, site: saved_site

    expect(saved_site.service_specifications).to contain_exactly(service_specification)
  end

  it 'restricts destruction when service specifications reference it' do
    saved_site = create :site
    create :service_specification, site: saved_site

    expect { saved_site.destroy }.not_to change(described_class, :count)
  end
end
