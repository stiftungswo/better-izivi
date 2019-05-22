# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::ServicesController, type: :request do
  context 'when user is signed in' do
    let(:user) { create :user }

    before { sign_in user }

    describe '#index' do
      subject(:json_response) { parse_response_json(response) }

      let!(:services) { create_pair :service }
      let(:request) { get v1_services_path }
      let(:first_service_json) do
        extract_to_json(services.first, :beginning, :ending, :confirmation_date, :id)
          .merge(service_specification: services.first.service_specification.name)
      end
      let(:second_service_json) do
        extract_to_json(services.second, :beginning, :ending, :confirmation_date, :id)
          .merge(service_specification: services.second.service_specification.name)
      end

      before { request }

      it_behaves_like 'renders a successful http status code'

      it 'returns the correct data', :aggregate_failures do
        expect(json_response.length).to eq 2
        expect(json_response).to include(first_service_json)
        expect(json_response).to include(second_service_json)
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

    describe '#create' do
      subject { -> { post_request } }

      let(:post_request) { post v1_services_path(service: params) }

      context 'when params are valid' do
        let(:service_specification) { create :service_specification }
        let(:params) { attributes_for(:service, service_specification: service_specification) }

        it_behaves_like 'renders a successful http status code' do
          let(:request) { post_request }
        end

        it { is_expected.to change(Holiday, :count).by(1) }

        it 'returns the created holiday' do
          post_request
          expect(parse_response_json(response)).to include(
                                                     id: Holiday.last.id,
                                                     beginning: params[:beginning],
                                                     ending: params[:ending],
                                                     holiday_type: params[:holiday_type].to_s,
                                                     description: params[:description]
                                                   )
        end
      end

      context 'when params are invalid' do
        let(:params) { { description: '', ending_date: 'I am invalid' } }

        it { is_expected.to change(Holiday, :count).by(0) }

        describe 'returned error' do
          it_behaves_like 'renders a validation error response' do
            let(:request) { post_request }
          end

          it 'renders all validation errors' do
            post_request
            expect(parse_response_json(response)[:errors]).to include(
                                                                ending: be_an_instance_of(Array),
                                                                beginning: be_an_instance_of(Array),
                                                                description: be_an_instance_of(Array)
                                                              )
          end
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
