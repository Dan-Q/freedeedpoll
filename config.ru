require 'rubygems'
require 'sinatra' # I often vendor it inside the app folder with a path like 'vendor/sinatra/lib/sinatra.rb'

set :public,   File.expand_path(File.dirname(__FILE__) + '/public') #Include your public folder
set :views,    File.expand_path(File.dirname(__FILE__) + '/views')  #Include the views
set :environment, :production

disable :run, :reload

log = File.new("log/sinatra.log", "a") # This will make a nice sinatra log along side your apache access and error logs
STDOUT.reopen(log)
STDERR.reopen(log)

require 'deed'
run Sinatra::Application
