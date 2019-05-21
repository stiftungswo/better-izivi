# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::ServicesController, type: :request do
  context 'when user is signed in' do
    let(:user) { create :user }

    before { sign_in user }

    describe '#index' do
      let!(:services) { create_pair :service }
      let(:request) { get v1_services_path }
      let(:json_response) { parse_response_json(response) }

      it_behaves_like 'renders a successful http status code'

      it 'returns the correct data', :aggregate_failures do
        request

        expect(json_response.length).to eq 2
        expect(json_response).to include(
          beginning: I18n.l(services.first.beginning),
          ending: I18n.l(services.first.ending),
          confirmation_date: I18n.l(services.first.confirmation_date),
          service_specification: services.first.service_specification.name,
          id: services.first.id
        )

        expect(json_response).to include(
          beginning: I18n.l(services.second.beginning),
          ending: I18n.l(services.second.ending),
          confirmation_date: I18n.l(services.second.confirmation_date),
          service_specification: services.second.service_specification.name,
          id: services.second.id
        )
      end
    end

    describe 'GET #show' do
      let(:service) { create :service, user: user }
      let(:request) { get v1_service_path service }
      let(:expected_response) do
        extract_to_json(service, :id, :user_id, :service_specification_id, :beginning,
                        :ending, :confirmation_date, :eligible_personal_vacation_days,
                        :service_type, :first_swo_service, :long_service,
                        :probation_service, :feedback_mail_sent)
      end

      it_behaves_like 'renders a successful http status code'

      it 'renders the correct response' do
        request
        expect(parse_response_json(response)).to include(expected_response)
      end
    end

    describe 'POST #create' do
      context 'with valid params' do
        it 'creates a new Service' do
          expect do
            post :create, params: { service: valid_attributes }, session: valid_session
          end.to change(Service, :count).by(1)
        end

        it 'renders a JSON response with the new service' do
          post :create, params: { service: valid_attributes }, session: valid_session
          expect(response).to have_http_status(:created)
          expect(response.content_type).to eq('application/json')
          expect(response.location).to eq(service_url(Service.last))
        end
      end

      context 'with invalid params' do
        it 'renders a JSON response with errors for the new service' do
          post :create, params: { service: invalid_attributes }, session: valid_session
          expect(response).to have_http_status(:unprocessable_entity)
          expect(response.content_type).to eq('application/json')
        end
      end
    end

    describe 'PUT #update' do
      context 'with valid params' do
        let(:new_attributes) do
          skip('Add a hash of attributes valid for your model')
        end

        it 'updates the requested service' do
          service = create :service, valid_attributes
          put :update, params: { id: service.to_param, service: new_attributes }, session: valid_session
          service.reload
          skip('Add assertions for updated state')
        end

        it 'renders a JSON response with the service' do
          service = create :service, valid_attributes

          put :update, params: { id: service.to_param, service: valid_attributes }, session: valid_session
          expect(response).to have_http_status(:ok)
          expect(response.content_type).to eq('application/json')
        end
      end

      context 'with invalid params' do
        it 'renders a JSON response with errors for the service' do
          service = create :service, valid_attributes

          put :update, params: { id: service.to_param, service: invalid_attributes }, session: valid_session
          expect(response).to have_http_status(:unprocessable_entity)
          expect(response.content_type).to eq('application/json')
        end
      end
    end

    describe 'DELETE #destroy' do
      it 'destroys the requested service' do
        service = create :service, valid_attributes
        expect do
          delete :destroy, params: { id: service.to_param }, session: valid_session
        end.to change(Service, :count).by(-1)
      end
    end
  end

  context 'when no user is signed in' do
    describe '#index' do
      it_behaves_like 'protected resource' do
        let(:request) { get v1_services_path }
      end
    end

    describe '#show' do
      let!(:service) { create :service }

      it_behaves_like 'protected resource' do
        let(:request) { get v1_service_path service }
      end
    end
  end
end
