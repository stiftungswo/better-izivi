FROM ruby:3.4.10

LABEL maintainer="SWO"
LABEL version="0.1"
LABEL description="Izivi backend"

ENV BUNDLER_VERSION=2.6.9
ENV RAILS_ENV=production
ENV RACK_ENV=production

RUN gem install bundler -v "2.6.9" --no-document
RUN apt-get update && apt-get install -y mariadb-client pdftk

RUN useradd -ms /bin/bash rails

WORKDIR /api
COPY Gemfile* ./
COPY . /api

RUN chown -R rails:rails /api /usr/local/bundle
USER rails

RUN bundle install --jobs=8

EXPOSE 3000
CMD ["bin/rails", "server", "-p", "3000", "-b", "0.0.0.0", "-e", "production"]
