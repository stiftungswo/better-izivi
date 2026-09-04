# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::SitesController, type: :request do
  context 'when the user is signed in as admin' do
    let(:user) { create :user, :admin }

    before { sign_in user }

    describe '#index' do
      let(:request) { get v1_sites_path }
      let!(:site) { create :site }

      it 'returns all sites', :aggregate_failures do
        request

        response_site = parse_response_json(response).first
        expect(response_site).to include(
          id: site.id, name: site.name, language: site.language,
          terms_pdf_filename: site.terms_pdf.filename.to_s
        )
        expect(response_site[:terms_pdf_url]).to be_present
      end

      it_behaves_like 'renders a successful http status code'
    end

    describe '#create' do
      let(:post_request) { post v1_sites_path, params: { site: params } }
      let(:params) do
        { name: 'Basel', language: 'german', terms_pdf: fixture_file_upload('sample_terms.pdf', 'application/pdf') }
      end

      it_behaves_like 'renders a successful http status code' do
        let(:request) { post_request }
      end

      it 'creates a new Site' do
        expect { post_request }.to change(Site, :count).by(1)
      end

      it 'attaches the uploaded terms pdf' do
        post_request

        expect(Site.last.terms_pdf).to be_attached
      end

      context 'when params are invalid' do
        let(:params) { { name: '', language: 'german' } }

        it 'does not create a new Site' do
          expect { post_request }.not_to change(Site, :count)
        end

        it_behaves_like 'renders a validation error response' do
          let(:request) { post_request }
        end
      end
    end

    describe '#update' do
      let!(:site) { create :site }
      let(:put_request) { put v1_site_path(site, params: { site: params }) }

      context 'with valid params' do
        let(:params) { { name: 'New name' } }

        it 'updates the site name' do
          expect { put_request }.to(change { site.reload.name }.to('New name'))
        end

        it_behaves_like 'renders a successful http status code' do
          let(:request) { put_request }
        end
      end

      context 'with invalid params' do
        let(:params) { { name: '' } }

        it_behaves_like 'renders a validation error response' do
          let(:request) { put_request }
        end
      end
    end
  end

  context 'when the user is signed in but not an admin' do
    let(:user) { create :user }

    before { sign_in user }

    describe '#index' do
      it_behaves_like 'admin protected resource' do
        let(:request) { get v1_sites_path }
      end
    end

    describe '#create' do
      it_behaves_like 'admin protected resource' do
        let(:request) { post v1_sites_path(site: { name: 'Basel', language: 'german' }) }
      end
    end
  end

  context 'when no user is signed in' do
    describe '#index' do
      it_behaves_like 'login protected resource' do
        let(:request) { get v1_sites_path }
      end
    end
  end
end
