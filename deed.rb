#!/usr/bin/ruby
require 'rubygems'
require 'bundler'
Bundler.require

require 'prawn/measurement_extensions'

class Fixnum
  def ordinalize
    i = to_i
    return "#{i}th" if i < 21 && i > 3
    case(i % 10)
      when 1
        "#{i}st"
      when 2
        "#{i}nd"
      when 3
        "#{i}rd"
      else
        "#{i}th"
    end
  end
end

raise "Copy config/encryptor.sample.rb to config/encryptor.rb and edit the secret key inside it." unless File::exists?('./config/encryptor.rb')
require './config/encryptor.rb'
raise "Copy config/hotlink-prevention.sample.rb to config/hotlink-prevention.rb and edit the secret key inside it." unless File::exists?('./config/hotlink-prevention.rb')
require './config/hotlink-prevention.rb'

module Encryption
  require 'yaml'
  require 'base64'

  def Encryption.encrypt(plaintext)
    Base64::encode64(Encryptor::encrypt(plaintext.to_yaml, :key => ENCRYPTION_KEY)).gsub(/[ \n]/m, '').gsub('+','.')
  end

  def Encryption.decrypt(ciphertext)
    YAML::load(Encryptor::decrypt(Base64::decode64(ciphertext.gsub('.', '+')), :key => ENCRYPTION_KEY))
  end
end

module HotlinkPrevention
  require 'date'
  require 'digest/md5'
  VALID_DURATION = 60 * 60 * 6 # 6 hours

  def HotlinkPrevention.code(now = DateTime::now)
    today = now.strftime('%Y%m%d%H%M%S')
    key = Digest::MD5::hexdigest("#{today}#{HOTLINK_PREVENTION_SECRET_KEY}")
    "#{today}#{key}"
  end

  def HotlinkPrevention.valid?(code, now = DateTime::now)
    return false unless code =~ /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})([a-f0-9]{32})$/ # invalid if wrong format
    code_made_at = DateTime::new($1.to_i, $2.to_i, $3.to_i, $4.to_i, $5.to_i, $6.to_i)
    code_age = (now.strftime('%s').to_i - code_made_at.strftime('%s').to_i)
    return false if code_age > VALID_DURATION || code_age < 0 # invalid if out of date or not yet valid
    code == HotlinkPrevention.code(code_made_at) # invalid if does not validate
  end
end

class Deed < Sinatra::Base
  configure :production, :development do
    enable :logging
  end
  configure :development do
    register Sinatra::Reloader
  end
  set :haml, :format => :html5

  MONTH_NAMES = %w{January February March April May June July August September October November December}

  before do
    @hotlink_code = HotlinkPrevention.code
  end
  
  get '/' do
    @today = Time::new.strftime('%Y-%m-%d')
    haml :index
  end

  get '/js/deed.js' do
    coffee :deed
  end

  get '/own' do
    redirect to('/') and return unless request.xhr?
    haml :own, :layout => false
  end

  get '/child' do
    redirect to('/') and return unless request.xhr?
    @month_names = MONTH_NAMES
    haml :child, :layout => false
  end

  post '/' do
    redirect to('/') and return unless HotlinkPrevention.valid?(params[:hotlink_code])
    ciphertext = Encryption.encrypt(params.reject{|k,v|k == 'hotlink_code'})
    if ciphertext.length > 1950
      # very long URL - render in place
      @bookmarkable, @decoded_params = false, params
      haml :result
    else
      # otherwise - redirect to bookmarkable URL
      redirect to("/d/#{Encryption.encrypt(params.reject{|k,v|k == 'hotlink_code'})}")
    end
  end

  get '/d/*' do
    ciphertext = params[:splat].first
    @bookmarkable, @decoded_params = true, Encryption.decrypt(ciphertext)
    haml :result
  end

  post '/deed-poll.pdf' do
    pdf = Prawn::Document.new(:page_size => 'A4',
                              :top_margin => 3.cm,
                              :bottom_margin => 3.cm,
                              :left_margin => 2.4.cm,
                              :right_margin => 2.4.cm)
    pdf.font_families.update(
      'Title' => { :normal => 'lib/fonts/OldeEnglish.ttf' },
      'Text' => { :normal => 'lib/fonts/LinLibertine_R.ttf' },
      'Bold' => { :normal => 'lib/fonts/LinLibertine_RB.ttf' }
    )
    
    pdf.font('Title')
    pdf.text_box('Deed of Change of Name', :size => 24, :align => :center)
    
    pdf.font('Text')
    pdf.font_size(11)

    clause = '1(1)'
    witnesses = (params[:w1_n].strip == '') ? 1 : 2
    #witnesses = (params[:special] == '37(1)-1' ? 1 : 2)
    #if params[:date] !~ /^(\d{4})-(\d{2})-(\d{2})$/
      Time::new.strftime('%Y-%m-%d').strip =~ /^(\d{4})-(\d{2})-(\d{2})$/
    #end
    year, month, day = $1.to_i, MONTH_NAMES[$2.to_i - 1], $3.to_i

    pdf.formatted_text_box([ 
                           { :text => "\n\n\n\nBY THIS DEED OF CHANGE OF NAME", :font => 'Bold' },
                           { :text => ' made by myself the undersigned ' },
                           { :text => params[:nn].strip, :font => 'Bold' },
                           { :text => " of #{params[:a].strip}, #{params[:t].strip} in the County of #{params[:c]} formerly known as " },
                           { :text => params[:on].strip, :font => 'Bold' },
                           { :text => ", a British Citizen under section #{clause} of the British Nationality Act 1981" },
                           { :text => "\n\nHEREBY DECLARE AS FOLLOWS:", :font => 'Bold' },
                           { :text => "\n\nI.    I ABSOLUTELY", :font => 'Bold' },
                           { :text => " and entirely renounce, relinquish and abandon the use of my said former name #{params[:on].strip} and assume, adopt and determine to take and use from the date hereof the name of #{params[:nn].strip} in substitution for my former name of #{params[:on].strip}" },
                           { :text => "\n\nII.   I SHALL AT ALL TIMES", :font => 'Bold' },
                           { :text => " hereafter in all records, deeds documents and other writings and in all actions and proceedings as well as in all dealings and transactions and on all occasions whatsoever use and subscribe the said name of #{params[:nn].strip} as my name, in substitution for my former name of #{params[:on].strip} so relinquished as aforesaid to the intent that I may hereafter be called known or distinguished not by the former name of #{params[:on].strip} but by the name #{params[:nn].strip}" },
                           { :text => "\n\nIII.  I AUTHORISE AND REQUIRE", :font => 'Bold' },
                           { :text => " all persons at all times to designate, describe, and address me by the adopted name of #{params[:nn].strip}" },
                           { :text => "\n\nIN WITNESS", :font => 'Bold' },
                           { :text => " whereof I have hereunto subscribed my adopted and substituted name of #{params[:nn].strip} and also my said former name of #{params[:on].strip}." },
                           { :text => (params[:fnc] == '1' ? "\n\nNotwithstanding the decision of Mr Justice Vaisey in re Parrott, Cox v Parrott, the applicant wishes the enrolment to proceed." : '')},
                           { :text => "\n\nSIGNED AS A DEED THIS #{day.ordinalize.upcase} DAY OF #{month.upcase} IN THE YEAR #{year}", :font => 'Bold' },
                          ], {})

    wit1str = "#{params[:w1_n].strip}\n#{params[:w1_a].strip}, #{params[:w1_t].strip}"
    wit2str = (witnesses == 2 ? "#{params[:w2_n].strip}\n#{params[:w2_a].strip}, #{params[:w2_t].strip}" : '')
    pdf.make_table([
      ["\n" * 35,''],
      ["by the above name\n#{params[:nn].strip}", "by the above name\n#{params[:on].strip}"],
      ["\n" * 5,''],
      [wit1str, wit2str],
    ], { :width => 460, :cell_style => { :align => :center, :borders => [] } }).draw
    
    pdf.line_width = 1
    pdf.line(127, 650, 332, 650)
    pdf.stroke
    pdf.line_width = 0.5
    pdf.line(33, 222, 193, 222)
    pdf.line(260, 222, 420, 222)
    pdf.line(33, 113, 193, 113)
    pdf.line(260, 113, 420, 113) if witnesses == 2
    pdf.stroke
                          
    content_type 'application/pdf'
    attachment('deed-poll.pdf') if(params[:output] == 'attachment')
    pdf.render
  end

  # start the server if ruby file executed directly
  run! if app_file == $0
end
