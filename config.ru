require 'rubygems'
require 'bundler'

Bundler.require

set :public_folder,   File.expand_path(File.dirname(__FILE__) + '/public') #Include your public folder
set :views,           File.expand_path(File.dirname(__FILE__) + '/views')  #Include the views

disable :run, :reload

log = File.new("./log/sinatra.log", "a") # This will make a nice sinatra log along side your apache access and error logs
STDOUT.reopen(log)
STDERR.reopen(log)

require './deed'
run Deed
