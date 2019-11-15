# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Pdfs::ExpensesOverview::ExpensesOverviewAdditions do
  let(:additions) { described_class.new }

  it 'defines a TABLE_SUB_HEADER' do
    expect(additions::TABLE_SUB_HEADER).not_to eq null
  end

  it 'defines a TABLE_HEADER' do
    expect(additions::TABLE_HEADER).not_to eq null
  end

  it 'defines the COLOR_GREY' do
    expect(additions::COLOR_GREY).not_to eq null
  end
end
